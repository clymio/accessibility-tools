import { app } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import Joi from 'joi';
import path from 'path';
import sequelize, { getModel } from './db';
import joiLib from './joi';
class AxeCoreLib {
  /**
   * Gets the axe-core script to inject the axe object in the browser
   * @return The axe-core script
   */
  static async getAxeScript() {
    if (!app.isPackaged) {
      return fs.readFileSync('./node_modules/axe-core/axe.min.js', 'utf8');
    }
    const filePath = path.join(process.resourcesPath, 'axe.min.js');
    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * Get the script to run axe-core and return the results.
   * The script will return the results of the axe run or an error if something went wrong.
   * @return The script to run axe-core
   */
  static async getRunScript() {
    return `(async () => {
        if (!axe || axe._running) {
          return;
        }
        const results = await axe.run();
        return results;
      })()`;
  }

  /**
   * Handles the results of an axe run
   * @param {object} input
   * @param {object} input.results - Results of the axe run
   * @param {string} input.environment_page_id - environment page id
   * @param {string} input.environment_test_id - environment test id
   * @param {{}} opt
   */
  static async handleResult(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        results: Joi.object().required(),
        environment_page_id: Joi.string().required(),
        environment_test_id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      if (data.results instanceof Error) {
        log.error('Axe Error');
        throw new Error('Axe Error');
      }
      const TestCaseEnvironmentTestPage = getModel('testCaseEnvironmentTestPage'),
        TestCaseEnvironmentTestPageTarget = getModel('testCaseEnvironmentTestPageTarget'),
        EnvironmentTestPage = getModel('environmentTestPage'),
        TestCase = getModel('testCase');

      const STATUSES = {
        PASS: 'PASS',
        FAIL: 'FAIL',
        NOT_APPLICABLE: 'NOT_APPLICABLE',
        INCOMPLETE: 'INCOMPLETE'
      };

      const testCases = await TestCaseEnvironmentTestPage.findAll({
        where: {
          environment_page_id: data.environment_page_id,
          environment_test_id: data.environment_test_id,
          status: ['OPENED', 'IN_PROGRESS']
        },
        include: [
          {
            model: TestCase,
            as: 'test_case',
            attributes: ['id', 'name'],
            where: {
              type: 'AUTOMATIC'
            },
            include: [
              {
                model: getModel('systemAxeRules'),
                as: 'rules',
                attributes: ['id'],
                through: {
                  attributes: []
                }
              }
            ]
          }
        ]
      });

      const { violations, inapplicable, incomplete, passes } = data.results;

      const STATUS_RESULTS = {
        [STATUSES.INCOMPLETE]: incomplete,
        [STATUSES.NOT_APPLICABLE]: inapplicable,
        [STATUSES.PASS]: passes,
        [STATUSES.FAIL]: violations // keep the fail at the end so that it overwrites the other statuses
      };

      // update the status of the cases and add nodes to the test cases if present
      const updatedTestCases = testCases.map((tc) => {
        tc = tc.toJSON();
        tc.nodes = [];
        tc.status = 'INCOMPLETE'; // all test cases are incomplete at first, and then we update them
        for (const [key, data] of Object.entries(STATUS_RESULTS)) {
          for (const item of data) {
            const rule = item.id;
            if (tc.test_case.rules.map(r => r.id).includes(rule)) {
              const nodes = item.nodes;
              if (nodes && nodes.length > 0) {
                tc.nodes.push(
                  ...nodes.map(node => ({
                    rule: rule,
                    target: node.target[0],
                    html: node.html,
                    summary: node.failureSummary,
                    status: key
                  }))
                );
              }
              tc.status = key;
            }
          }
        }
        return tc;
      });

      const failedTestCaseIds = updatedTestCases.filter(tc => tc.status === STATUSES.FAIL).map(tc => tc.test_case.id);

      const casesWithRem = await TestCase.findAll({
        where: { id: failedTestCaseIds },
        attributes: ['id'],
        include: [
          {
            model: getModel('remediation'),
            as: 'remediations',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            },
            include: [
              {
                model: getModel('systemCategory'),
                as: 'category',
                attributes: ['id', 'name', 'priority']
              }
            ]
          },
          {
            model: getModel('systemStandardCriteria'),
            as: 'criteria',
            attributes: ['id'],
            through: {
              attributes: []
            },
            include: [
              {
                model: getModel('remediation'),
                as: 'remediations',
                attributes: ['id', 'name'],
                include: [
                  {
                    model: getModel('systemCategory'),
                    as: 'category',
                    attributes: ['id', 'name', 'priority']
                  }
                ]
              }
            ]
          }
        ]
      });

      const remMap = new Map(
        casesWithRem.map((tc) => {
          tc = tc.toJSON();
          let remediations = tc.remediations || [];
          if (!remediations || remediations.length === 0) {
            remediations = tc.criteria.map(c => c.remediations).flat();
          }
          if (!remediations || remediations.length === 0) {
            return [tc.id, null];
          }
          const sortedRemediations = remediations.sort((a, b) => b.category.priority - a.category.priority);
          return [tc.id, sortedRemediations[0].id];
        })
      );

      updatedTestCases.forEach((tc) => {
        tc.nodes.forEach((node) => {
          if (node.status !== STATUSES.FAIL) return;
          node.remediation_id = remMap.get(tc.test_case.id);
        });
      });

      // create the target data for each node
      let targetDataToCreate = [];
      for (const item of updatedTestCases) {
        for (const node of item.nodes) {
          targetDataToCreate.push({
            test_case_page_id: item.id,
            status: node.status,
            selector: node.target,
            html: node.html,
            summary: node.summary,
            rule: node.rule,
            remediation_id: node.remediation_id
          });
        }
      }
      await TestCaseEnvironmentTestPageTarget.bulkCreate(targetDataToCreate, {
        ignoreDuplicates: true,
        transaction
      });

      // update the status of the testCaseEnvironmentTestPage items
      for (const status of Object.values(STATUSES)) {
        const items = updatedTestCases.filter(tc => tc.status === status);
        await TestCaseEnvironmentTestPage.update(
          { status },
          {
            where: {
              id: items.map(tc => tc.id)
            },
            transaction
          }
        );
      }

      await EnvironmentTestPage.update(
        { end_date: new Date() },
        {
          where: {
            environment_page_id: data.environment_page_id,
            environment_test_id: data.environment_test_id
          },
          transaction
        }
      );
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      console.log('Error handling test results: ', e);
      throw e;
    }
  }
}

export default AxeCoreLib;
