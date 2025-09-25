import log from 'electron-log';
import fs from 'fs-extra';
import Joi from 'joi';
import path from 'path';
import sequelize, { getModel } from './db';
import joiLib from './joi';
import SettingsLib, { ARCHIVE_TYPES } from './settings';

const CHUNK_SIZE = 1000;

class ArchiveLib {
  /**
   * moves the test data to a json file, and deletes all test associations.
   * if archive file already exists, do nothing
   * doesn't delete the test row for any future lookups.
   * the data includes data of the test from the following tables:
   *  - environmentTest
   *  - environmentPage (structured and random pages)
   *  - testCaseEnvironmentTestPage (test cases for the test)
   *  - testCaseEnvironmentTestPageTarget (test case targets / nodes for the test)
   * @param {Object} input
   * @param {string} input.id - the id of the test
   * @param {{}} [opt]
   *  */
  static async archiveTest(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentTest = getModel('environmentTest'),
        EnvironmentPage = getModel('environmentPage'),
        TestCaseEnvironmentTestPage = getModel('testCaseEnvironmentTestPage'),
        TestCaseEnvironmentTestPageTarget = getModel('testCaseEnvironmentTestPageTarget');

      // get the test without test cases and nodes per page to avoid overloading the query
      const test = await EnvironmentTest.findByPk(data.id, {
        attributes: ['id', 'status'],
        include: [
          {
            model: EnvironmentPage,
            as: 'structured_pages',
            attributes: ['id']
          },
          {
            model: EnvironmentPage,
            as: 'random_pages',
            attributes: ['id']
          }
        ]
      });
      if (!test) {
        throw new Error('environment test not found');
      }
      let output = test.toJSON();

      // get test cases per page in chunks
      const getTestCasesPageInChunks = async () => {
        let allTestCases = [];
        let offset = 0;
        let shouldFetchMore = true;
        while (shouldFetchMore) {
          const testCases = await TestCaseEnvironmentTestPage.findAll({
            where: { environment_test_id: data.id },
            limit: CHUNK_SIZE,
            offset: offset,
            raw: true
          });
          if (testCases.length === 0) {
            shouldFetchMore = false;
          } else {
            allTestCases = allTestCases.concat(testCases);
            offset += CHUNK_SIZE;
          }
        }
        return allTestCases;
      };

      // get test case targets in chunks
      const getTestCaseTargetsInChunks = async (tcIds) => {
        let allTargetData = [];

        for (let i = 0; i < tcIds.length; i += CHUNK_SIZE) {
          let tcIdsChunk = tcIds.slice(i, i + CHUNK_SIZE);
          let targetOffset = 0;
          let shouldFetchMoreChunk = true;

          while (shouldFetchMoreChunk) {
            const targets = await TestCaseEnvironmentTestPageTarget.findAll({
              where: { test_case_page_id: tcIdsChunk },
              limit: CHUNK_SIZE,
              offset: targetOffset,
              raw: true
            });
            if (targets.length === 0) {
              shouldFetchMoreChunk = false;
            } else {
              allTargetData = allTargetData.concat(targets);
              targetOffset += CHUNK_SIZE;
            }
          }
        }

        return allTargetData;
      };

      const testCases = await getTestCasesPageInChunks();
      const targets = await getTestCaseTargetsInChunks(testCases.map(tc => tc.id));

      output.test_cases = testCases;
      output.targets = targets;

      const archiveFolder = await SettingsLib.getArchiveTypeFolderPath(ARCHIVE_TYPES.TEST);
      const archiveFilePath = path.join(archiveFolder, `${test.id}.json`);
      if (fs.existsSync(archiveFilePath)) {
        log.info(`environment test ${test.id} already archived`);
        return;
      }
      await test.destroyAssociations();
      fs.writeFileSync(archiveFilePath, JSON.stringify(output, null, 2));
      log.info(`environment test ${test.id} archived successfully`);
    } catch (e) {
      log.error('Error archiving environment test');
      log.debug(e);
      throw e;
    }
  }

  /**
   * gets test data from archive file and populates the data in the db, then deletes the archive file.
   * if archive file does not exist, does nothing
   * @param {Object} input
   * @param {string} input.id - the id of the test
   * @param {*} opt
   */
  static async unarchiveTest(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentTest = getModel('environmentTest'),
        EnvironmentTestPage = getModel('environmentTestPage'),
        TestCaseEnvironmentTestPage = getModel('testCaseEnvironmentTestPage'),
        TestCaseEnvironmentTestPageTarget = getModel('testCaseEnvironmentTestPageTarget');
      const archiveFolder = await SettingsLib.getArchiveTypeFolderPath(ARCHIVE_TYPES.TEST);
      const archiveFilePath = path.join(archiveFolder, `${data.id}.json`);
      if (!fs.existsSync(archiveFilePath)) {
        log.info(`environment test ${data.id} not archived`);
        return;
      }
      const testData = JSON.parse(fs.readFileSync(archiveFilePath));
      const { structured_pages, random_pages, test_cases, targets, status } = testData;
      await sequelize.transaction(async (t) => {
        const testObj = await EnvironmentTest.findByPk(data.id, { transaction: t });
        if (!testObj) {
          throw new Error('environment test not found');
        }
        testObj.status = status;
        const pageDataToAdd = [];
        for (const page of [...structured_pages, ...random_pages]) {
          const { ...rest } = page.environmentTestPage;
          pageDataToAdd.push(rest);
        }
        await Promise.all([
          EnvironmentTestPage.bulkCreate(pageDataToAdd, { transaction: t }),
          TestCaseEnvironmentTestPage.bulkCreate(test_cases, { transaction: t, hooks: false }),
          TestCaseEnvironmentTestPageTarget.bulkCreate(targets, { transaction: t })
        ]);
        await testObj.save({ transaction: t });
      });
      fs.unlinkSync(archiveFilePath);
      log.info(`environment test ${data.id} unarchived successfully`);
    } catch (e) {
      log.error(`Error unarchiving environment test ${data.id}`);
      log.debug(e);
    }
  }
}

export default ArchiveLib;
