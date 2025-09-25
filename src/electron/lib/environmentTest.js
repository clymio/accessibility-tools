import { REPORT_FORMATS, REPORT_TYPES } from '@/constants/report';
import { formatDate } from 'date-fns';
import Joi from 'joi';
import { literal, Op } from 'sequelize';
import { ENVIRONMENT_TEST_CASE_STATUS_VALUES } from '../db/models/environmentTest';
import ArchiveLib from './archive';
import CoreLib from './core';
import sequelize, { getModel } from './db';
import EnvironmentPageLib from './environmentPage';
import joiLib from './joi';
import ReportLib from './report';
import TestRunner from './testRunner';

class EnvironmentTestLib {
  /**
   * Finds environment tests based on the specified filters.
   * @param {Object} input
   * @param {string} [input.id] - Specific environment test ID to find.
   * @param {string} [input.search] - Search term for matching test names.
   * @param {string} [input.status] - Status of the environment test.
   * @param {Date} [input.start_date] - The start date for filtering tests.
   * @param {Date} [input.end_date] - The end date for filtering tests.
   * @param {string} [input.project_id] - Project ID associated with the test.
   * @param {string} [input.environment_id] - Environment ID associated with the test.
   * @param {Object} [input.sort] - Sorting options for the results.
   * @param {string} [input.sort.field] - Field to sort by.
   * @param {string} [input.sort.direction] - Sorting direction (ASC or DESC).
   * @param {number} [input.page] - Page number for pagination.
   * @param {number} [input.limit] - Number of results per page.
   * @param {Object} [opt]
   * @param {boolean} [opt.detailed] - Whether to return detailed results or not.
   * @returns {Promise<Object[]>} - A paginated list of environment tests matching the criteria.
   */
  static async find(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().optional(),
        search: Joi.metaSearch(),
        status: Joi.enum(ENVIRONMENT_TEST_CASE_STATUS_VALUES).optional(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        project_id: Joi.id().optional(),
        environment_id: Joi.id().optional(),
        exclude_closed: Joi.boolean().optional(),
        sort: Joi.object({
          field: Joi.string().required(),
          direction: Joi.enum(['ASC', 'DESC', 'asc', 'desc']).required()
        })
          .optional()
          .allow({}),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentTest = getModel('environmentTest');
      const where = {},
        include = [],
        order = [];
      const hasSort = data.sort && data.sort.field && data.sort.direction;
      if (hasSort) {
        data.sort.direction = data.sort.direction.toUpperCase();
      }
      if (data.id) {
        return await this.read({ id: data.id });
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      if (data.exclude_closed) {
        where.status = {
          [Op.not]: 'CLOSED'
        };
      }
      if (data.status) {
        // gets importance over exclude_closed
        where.status = data.status;
      }
      if (data.start_date) {
        where.start_date = { [Op.gte]: data.start_date };
      }
      if (data.end_date) {
        where.end_date = { [Op.lte]: data.end_date };
      }
      if (data.environment_id) {
        where.environment_id = data.environment_id;
      }
      if (data.project_id) {
        include.push({
          model: getModel('environment'),
          where: { project_id: data.project_id },
          as: 'environment',
          attributes: [],
          required: true
        });
      }
      if (hasSort) {
        if (data.sort.field === 'standard') {
        } else if (data.sort.field === 'testTargets') {
        } else {
          order.push([data.sort.field, data.sort.direction]);
        }
      } else {
        order.push(['created_at', 'DESC']);
      }
      if (opt.detailed) {
        include.push({
          model: getModel('environment'),
          as: 'environment',
          attributes: ['id', 'name', 'url']
        });
        include.push({
          model: getModel('environmentPage'),
          as: 'structured_pages',
          attributes: ['id', 'path', 'name'],
          through: {
            attributes: []
          }
        });
        include.push({
          model: getModel('environmentPage'),
          as: 'random_pages',
          attributes: ['id', 'path', 'name'],
          through: {
            attributes: []
          }
        });
      }
      const qry = CoreLib.paginateQuery({ where, include, order }, data, opt);
      const res = await EnvironmentTest.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding environmentTests: ', e);
    }
  }

  /**
   * Finds a single environment test by id
   * @param {Object} input
   * @param {string} input.id - the id of the test
   * @param {{}} [opt]
   * @return {Promise<Object>} - Test object
   */
  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentTest = getModel('environmentTest');
      const test = await EnvironmentTest.findByPk(data.id, {
        include: [
          {
            model: getModel('environment'),
            as: 'environment',
            attributes: ['id', 'name', 'url']
          },
          {
            model: getModel('environmentPage'),
            as: 'structured_pages',
            attributes: ['id', 'path', 'name'],
            through: {
              attributes: []
            }
          },
          {
            model: getModel('environmentPage'),
            as: 'random_pages',
            attributes: ['id', 'path', 'name'],
            through: {
              attributes: []
            }
          }
        ]
      });
      return test.toJSON();
    } catch (e) {
      console.log('Error reading environment test: ', e);
    }
  }

  /**
   * Creates a new environment test.
   * @param {Object} input
   * @param {string} input.name - Name of the test
   * @param {string[]} input.pages - IDs of the pages to test
   * @param {string} [input.functionality_note] - Note for the test about the functionality
   * @param {string} [input.page_variety_note] - Note for the test about the page variety
   * @param {string} input.environment_id - ID of the environment
   * @param {Object} [opt]
   * @param {boolean} [opt.start] - Whether to start the test immediately after creation
   * @return {Promise<Object>} - The newly created environment test object
   */
  static async create(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        name: Joi.string().required(),
        structured_pages: Joi.array().items(Joi.id()).required().min(1),
        random_pages: Joi.array().items(Joi.id()).required().min(1),
        functionality_note: Joi.string().optional().allow(''),
        page_variety_note: Joi.string().optional().allow(''),
        environment_id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const EnvironmentTest = getModel('environmentTest');
      const test = await EnvironmentTest.create(
        {
          name: data.name,
          functionality_note: data.functionality_note,
          page_variety_note: data.page_variety_note,
          environment_id: data.environment_id
        },
        { transaction }
      );
      await test.addStructured_pages(data.structured_pages, { transaction });
      await test.addRandom_pages(data.random_pages, { transaction });
      await transaction.commit();
      await EnvironmentPageLib.createTestCases({ environment_test_id: test.id, pages: [...data.structured_pages, ...data.random_pages] });
      if (opt.start) {
        await this.startTest({ id: test.id });
      }
      const updatedTestObj = await this.read({ id: test.id });
      return updatedTestObj;
    } catch (e) {
      console.log('Error creating environment test: ', e);
      await transaction.rollback();
    }
  }

  /**
   * Updates an existing environment test.
   * @param {Object} input
   * @param {string} input.id - ID of the environment test to update
   * @param {string} [input.name] - New name for the test
   * @param {string[]} [input.pages] - New IDs of the pages to test
   * @param {string} [input.functionality_note] - New note for the test about the functionality
   * @param {string} [input.page_variety_note] - New note for the test about the page variety
   * @param {string} [input.environment_id] - New ID of the environment
   * @param {{}} [opt]
   * @return {Promise<Object>} - The updated environment test object
   * @throws Will throw an error if the environment test is not found.
   * @note we do not allow updating test cases for an environment test. For that, the user needs to duplicate the environment test and then create it with new test cases
   */
  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required(),
        name: Joi.string().optional(),
        random_pages: Joi.array().items(Joi.id()).optional(),
        structured_pages: Joi.array().items(Joi.id()).optional(),
        functionality_note: Joi.string().optional().allow(''),
        page_variety_note: Joi.string().optional().allow(''),
        environment_id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const EnvironmentTest = getModel('environmentTest');
      const test = await EnvironmentTest.findByPk(data.id, {
        include: ['structured_pages', 'random_pages']
      });
      if (!test) {
        throw new Error('Environment test not found');
      }
      if (data.name) {
        test.name = data.name;
      }
      if (data.functionality_note) {
        test.functionality_note = data.functionality_note;
      }
      if (data.page_variety_note) {
        test.page_variety_note = data.page_variety_note;
      }
      if (data.environment_id) {
        test.environment_id = data.environment_id;
      }
      if (data.structured_pages && data.structured_pages.length > 0) {
        await test.setStructured_pages(data.structured_pages, { transaction });
      }
      if (data.random_pages && data.random_pages.length > 0) {
        await test.setRandom_pages(data.random_pages, { transaction });
      }
      await test.save({ transaction });
      await transaction.commit();
      return this.read({ id: test.id });
    } catch (e) {
      await transaction.rollback();
      console.log('Error updating environment test: ', e);
    }
  }

  /**
   * Starts an environment test
   * @param {Object} input
   * @param {string} input.id - The id of the environment test.
   * @param {{}} [opt]
   * @returns {Object} - The updated environment test object in JSON format.
   * @throws Will throw an error if the environment test is not found.
   */
  static async startTest(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentTest = getModel('environmentTest');
      const testObj = await EnvironmentTest.findByPk(data.id);
      if (!testObj) {
        throw new Error('environment test not found');
      }
      await testObj.update({ status: 'IN_PROGRESS', start_date: new Date() });
      const testRunner = new TestRunner(testObj.id);
      testRunner.run();
      return testObj.toJSON();
    } catch (e) {
      console.log('Error reading environment test: ', e);
    }
  }

  /**
   * Reopens a closed environment test by unarchiving it.
   * @param {Object} input
   * @param {string} input.id - The id of the environment test to reopen.
   * @param {{}} [opt]
   * @returns {Object}
   * @throws Will throw an error if the environment test is not found.
   */
  static async openClosedTest(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentTest = getModel('environmentTest');
      const test = await EnvironmentTest.findByPk(data.id);
      if (!test) {
        throw new Error('environment test not found');
      }
      await ArchiveLib.unarchiveTest({ id: test.id });
      return test.toJSON();
    } catch (e) {
      console.log('Error reading environment test: ', e);
    }
  }

  /**
   * Closes an environment test.
   * @param {Object} input
   * @param {string} input.id - The id of the environment test.
   * @param {{}} [opt]
   * @returns {Object} - The updated environment test object in JSON format.
   * @throws Will throw an error if the environment test is not found.
   */
  static async closeTest(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentTest = getModel('environmentTest');
      const test = await EnvironmentTest.findByPk(data.id);
      if (!test) {
        throw new Error('environment test not found');
      }
      await ArchiveLib.archiveTest({ id: test.id });
      await test.update({ status: 'CLOSED', end_date: new Date() });
      return test.toJSON();
    } catch (e) {
      console.log('Error closing environment test: ', e);
    }
  }

  /**
   * Retrieves the sitemap for a specific environment test.
   * @param {Object} input
   * @param {string} input.id - The ID of the environment test.
   * @param {{}} [opt]
   * @returns {Promise<Object>} - The sitemap tree of the environment test pages.
   * @throws Will throw an error if the environment test is not found.
   */
  static async getSitemap(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentTest = getModel('environmentTest');
      const environmentTest = await EnvironmentTest.findByPk(data.id, {
        include: [
          {
            model: getModel('environmentPage'),
            as: 'structured_pages',
            attributes: ['id', 'path', 'name', 'parent_id', 'not_clickable'],
            through: {
              attributes: []
            }
          },
          {
            model: getModel('environmentPage'),
            as: 'random_pages',
            attributes: ['id', 'path', 'name', 'parent_id', 'not_clickable'],
            through: {
              attributes: []
            }
          }
        ]
      });
      if (!environmentTest) {
        throw new Error('environment test not found');
      }
      const environmentTestObj = environmentTest.toJSON();
      const testPages = [...environmentTestObj.structured_pages, ...environmentTestObj.random_pages];
      const tree = await buildTree(testPages);
      return tree;
    } catch (e) {
      console.log('Error getting environment test sitemap: ', e);
    }
  }

  /**
   * get stats for a specific environment test.
   * @param {Object} input
   * @param {string} input.id - The ID of the environment test.
   * @param {{}} [opt]
   * @returns {Promise<Object>}
   * @throws Will throw an error if the environment test is not found.
   */
  static async getStats(input = {}, opt = {}) {
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
        TestCaseEnvironmentTestPageTarget = getModel('testCaseEnvironmentTestPageTarget'),
        Profile = getModel('profile');
      const environmentTest = await EnvironmentTest.findByPk(data.id, {
        attributes: ['id', 'name', 'status', 'start_date', 'end_date']
      });
      if (!environmentTest) {
        throw new Error('environment test not found');
      }
      const testCaseStatusCol = '`testCaseEnvironmentTestPageTarget`.`status`';
      const principleNameCol = '`test->test_case->criteria->principle`.`name`';
      const pageCounts = await TestCaseEnvironmentTestPageTarget.findAll({
        attributes: [
          [literal(`COUNT(*)`), 'totalCount'],
          [literal(`COUNT(CASE WHEN ${testCaseStatusCol} NOT IN ('MANUAL', 'IN_PROGRESS') THEN 1 END)`), 'doneCount'],
          [literal(`COUNT(CASE WHEN ${testCaseStatusCol} = 'MANUAL' THEN 1 END)`), 'manualCount'],
          [literal(`COUNT(CASE WHEN ${testCaseStatusCol} != 'MANUAL' THEN 1 END)`), 'automatedCount'],
          [literal(`COUNT(CASE WHEN ${testCaseStatusCol} = 'FAIL' THEN 1 END)`), 'failedCount'],
          [literal(`COUNT(CASE WHEN ${testCaseStatusCol} = 'PASS' THEN 1 END)`), 'passedCount'],
          [literal(`COUNT(CASE WHEN ${testCaseStatusCol} = 'INCOMPLETE' THEN 1 END)`), 'incompleteCount'],
          [literal(`COUNT(CASE WHEN ${testCaseStatusCol} = 'INCOMPLETE' THEN 1 END)`), 'incompleteCount'],
          [literal(`COUNT(CASE WHEN ${principleNameCol} = 'Perceivable' THEN 1 END)`), 'perceivableTotal'],
          [literal(`COUNT(CASE WHEN ${principleNameCol} = 'Operable' THEN 1 END)`), 'operableTotal'],
          [literal(`COUNT(CASE WHEN ${principleNameCol} = 'Understandable' THEN 1 END)`), 'understandableTotal'],
          [literal(`COUNT(CASE WHEN ${principleNameCol} = 'Robust' THEN 1 END)`), 'robustTotal'],
          [literal(`COUNT(CASE WHEN ${principleNameCol} = 'Perceivable' AND ${testCaseStatusCol} != 'MANUAL' THEN 1 END)`), 'perceivableCount'],
          [literal(`COUNT(CASE WHEN ${principleNameCol} = 'Operable' AND ${testCaseStatusCol} != 'MANUAL' THEN 1 END)`), 'operableCount'],
          [literal(`COUNT(CASE WHEN ${principleNameCol} = 'Understandable' AND ${testCaseStatusCol} != 'MANUAL' THEN 1 END)`), 'understandableCount'],
          [literal(`COUNT(CASE WHEN ${principleNameCol} = 'Robust' AND ${testCaseStatusCol} != 'MANUAL' THEN 1 END)`), 'robustCount']
        ],
        include: [
          {
            model: TestCaseEnvironmentTestPage,
            attributes: ['id', 'environment_page_id'],
            as: 'test',
            where: {
              environment_test_id: data.id,
              status: {
                [Op.ne]: 'ERROR'
              }
            },
            include: [
              {
                model: getModel('testCase'),
                as: 'test_case',
                attributes: ['id'],
                include: [
                  {
                    model: getModel('systemStandardCriteria'),
                    as: 'criteria',
                    attributes: ['id'],
                    through: {
                      attributes: []
                    },
                    include: [
                      {
                        model: getModel('systemStandardPrinciple'),
                        as: 'principle',
                        attributes: ['id', 'name']
                      }
                    ]
                  }
                ]
              },
              {
                model: getModel('environmentPage'),
                as: 'environment_page',
                attributes: ['id', 'name', 'path'],
                include: [
                  {
                    model: getModel('environment'),
                    as: 'environment',
                    attributes: ['id', 'name', 'url']
                  }
                ]
              }
            ]
          }
        ],
        group: ['`test`.`environment_page_id`']
      });

      for (let i = 0; i < pageCounts.length; i++) {
        pageCounts[i] = pageCounts[i]?.toJSON();
      }
      pageCounts.sort((a, b) => {
        const envPageA = a.test.environment_page;
        const envPageB = b.test.environment_page;
        if (envPageA.name === 'Home') return -1; // Keep "Home" on top
        if (envPageB.name === 'Home') return 1; // Keep "Home" on top
        return envPageA.name.localeCompare(envPageB.name);
      });

      const pageCount = await EnvironmentTestPage.count({
        where: {
          environment_test_id: data.id
        }
      });

      const counts = pageCounts.reduce((acc, pageCount) => {
        for (const key in pageCount) {
          const value = pageCount[key];
          if (typeof value === 'number') {
            acc[key] = (acc[key] || 0) + value;
          }
        }
        return acc;
      }, {});

      const profiles = await Profile.findAll({
        include: [
          {
            model: getModel('profileOrganization'),
            as: 'organization',
            attributes: ['id', 'logo', 'name', 'email', 'phone', 'address', 'address_2', 'city', 'zip_code', 'url'],
            include: [
              {
                model: getModel('systemCountry'),
                as: 'country',
                attributes: ['id', 'name', 'short_name', 'phone_prefix']
              },
              {
                model: getModel('systemState'),
                as: 'state',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });
      const profile = profiles[0]?.toJSON();

      return {
        total: counts.totalCount,
        totalPages: pageCount,
        completed: counts.doneCount,
        manual: counts.manualCount,
        automated: counts.automatedCount,
        failed: counts.failedCount,
        passed: counts.passedCount,
        incomplete: counts.incompleteCount,
        principleStats: {
          perceivable: {
            count: counts.perceivableCount,
            total: counts.perceivableTotal
          },
          operable: {
            count: counts.operableCount,
            total: counts.operableTotal
          },
          understandable: {
            count: counts.understandableCount,
            total: counts.understandableTotal
          },
          robust: {
            count: counts.robustCount,
            total: counts.robustTotal
          }
        },
        test: environmentTest.toJSON(),
        pageStats: pageCounts,
        ...(profile && profile.organization ? { auditor: profile } : {})
      };
    } catch (e) {
      console.log('Error getting environment test stats: ', e);
    }
  }

  /**
   * checks if an environment test needs manual checking.
   * @param {Object} input
   * @param {string} input.id - id of the environment test to check.
   * @param {{}} [opt]
   * @returns true if at least one test target needs manual checking.
   */
  static async doesTestNeedManualCheck(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const TestCaseEnvironmentTestPageTarget = getModel('testCaseEnvironmentTestPageTarget');
      const target = await TestCaseEnvironmentTestPageTarget.findOne({
        attributes: ['id', 'status'],
        where: {
          status: ['MANUAL', 'INCOMPLETE', 'ERROR']
        },
        include: [
          {
            model: getModel('testCaseEnvironmentTestPage'),
            as: 'test',
            where: { environment_test_id: data.id },
            attributes: ['id', 'environment_test_id', 'status']
          }
        ]
      });
      return !!target;
    } catch (e) {
      console.log('Error checking if test needs manual check: ', e);
    }
  }

  /**
   * Generates a PDF report for an environment test.
   * @param {Object} input
   * @param {string} input.id - The id of the environment test.
   * @param {{}} [opt]
   * @returns - The buffer data and file name
   * @throws Will throw an error if the environment test is not found.
   */
  static async generateReport(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentTest = getModel('environmentTest');
      const envTest = await EnvironmentTest.findByPk(data.id, {
        attributes: ['id', 'name']
      });
      if (!envTest) {
        throw new Error('Environment Test not found');
      }
      const PDF = new ReportLib(REPORT_TYPES.TEST, data, REPORT_FORMATS.PDF, {
        header: { template: '<div style="margin-bottom: 64px;"><div/>' },
        footer: {
          template: `
                    <div style="font-size: 14px; width:100%; font-family:Arial, sans-serif; box-sizing:border-box; color:#666; position:relative; text-align: right; margin: 0 64px;">
                      <p>Page <strong class="pageNumber"></strong> of <span class="totalPages"></span></p>
                    </div>`
        }
      });
      const pdfBuffer = await PDF.start();
      return { buffer: pdfBuffer, name: `${envTest.name}-${formatDate(new Date(), 'yyyy-MM-dd')}` };
    } catch (e) {
      console.log('Error generating environment test report: ', e);
    }
  }
}

export default EnvironmentTestLib;

async function buildTree(testPages) {
  const EnvironmentPage = getModel('environmentPage');
  const pageMap = {};

  testPages.forEach((page) => {
    page.children = [];
    pageMap[page.id] = page;
  });

  async function attachParent(page) {
    if (!page.parent_id) return; // Top-level page already

    // If the parent page is not already in our lookup, fetch it from the DB.
    if (!pageMap[page.parent_id]) {
      const parentObj = await EnvironmentPage.findByPk(page.parent_id, {
        attributes: ['id', 'name', 'parent_id']
      });
      if (parentObj) {
        let parentPage = parentObj.toJSON();
        parentPage.children = [];
        parentPage.not_clickable = true;
        pageMap[parentPage.id] = parentPage;
        await attachParent(parentPage);
      }
    }
    // At this point the parent should be in our lookup; attach the current page to it.
    if (pageMap[page.parent_id]) {
      pageMap[page.parent_id].children.push(page);
    }
  }
  function sortSitemap(sitemap) {
    sitemap.sort((a, b) => {
      if (a.name === 'Home') return -1; // Keep "Home" on top
      if (b.name === 'Home') return 1; // Keep "Home" on top
      return a.name.localeCompare(b.name); // Alphabetical sort
    });
    sitemap.forEach((item) => {
      if (item.children) {
        sortSitemap(item.children); // Recursively sort children
      }
    });
    return sitemap;
  }
  function cleanTree(page) {
    if (page.children && page.children.length > 0) {
      page.children.forEach(child => cleanTree(child));
    } else {
      delete page.children;
    }
  }

  for (const page of testPages) {
    if (page.parent_id) {
      await attachParent(page);
    }
  }

  // Build the final tree with the top-level pages
  const tree = Object.values(pageMap).filter(page => !page.parent_id);
  tree.forEach(page => cleanTree(page));
  return sortSitemap(tree);
}
