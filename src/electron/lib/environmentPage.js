import Joi from 'joi';
import { Op } from 'sequelize';
import { STANDARD_CRITERIA_LEVELS } from '../db/models/system/standardCriteria';
import { TEST_CASE_PAGE_STATUS_VALUES } from '../db/models/testCaseEnvironmentTestPageTarget';
import CoreLib from './core';
import sequelize, { bulkUpdateColumn, getModel } from './db';
import EnvironmentLib from './environment';
import EnvironmentTestLib from './environmentTest';
import joiLib from './joi';
import { fixTcTargets, formatDate, strToCase } from './utils';

class EnvironmentPageLib {
  /**
   * Updates the sitemap of an environment based on the provided sitemap tree.
   * @param {Object} input
   * @param {number} input.environment_id - The ID of the environment to update.
   * @param {Array<string>} input.sitemap - The sitemap tree, where each string is a full URL.
   * @param {{}} opt
   * @returns {Promise<void>} Resolves when the update is complete.
   */
  static async updateSitemap(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        environment_id: Joi.id().required(),
        sitemap: Joi.array().items().optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentPage = getModel('environmentPage');
      const environment = await EnvironmentLib.read({ id: data.environment_id });
      if (!environment) throw new Error('Environment not found');
      const url = environment.url;
      let initDepth = 0,
        paths = [];
      try {
        paths = new URL(url).pathname.split('/').filter(Boolean);
        initDepth = paths.length;
      } catch {}
      const sitemap = data.sitemap;
      const pathToIdMap = new Map();
      let currPageId = null;

      // check any already added pages in the db
      const currPages = await EnvironmentPage.findAll({ where: { environment_id: environment.id }, attributes: ['id', 'path'] });
      for (let currPage of currPages) {
        currPage = currPage.toJSON();
        pathToIdMap.set(currPage.path, currPage.id);
      }
      const currPagePath = paths.length === initDepth ? '' : paths[paths.length - 1];
      if (pathToIdMap.has(currPagePath)) {
        currPageId = pathToIdMap.get(currPagePath);
      }

      await sequelize.transaction(async (t) => {
        for (const url of sitemap) {
          const parsedUrl = new URL(url);
          const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
          const fullPath = pathSegments.slice(initDepth).join('/');
          const currPath = pathSegments.length === initDepth ? '' : pathSegments[pathSegments.length - 1];
          const name = currPath ? createLabel(currPath) : 'Home';

          // Skip if already processed
          if (pathToIdMap.has(fullPath)) {
            continue;
          }

          // Resolve parent ID for this path
          let parentId = null;
          for (let i = 0; i < pathSegments.length - 1; i++) {
            const parentPath = pathSegments.slice(initDepth, i + 1).join('/');

            if (parentPath) {
              // these paths weren't created so they likely don't have a dedicated page
              if (!pathToIdMap.has(parentPath)) {
                const parentLabel = createLabel(pathSegments[i]);
                const newParentPage = await EnvironmentPage.create(
                  {
                    environment_id: environment.id,
                    name: parentLabel,
                    path: parentPath,
                    not_clickable: true,
                    parent_id: parentId
                  },
                  { transaction: t }
                );
                pathToIdMap.set(parentPath, newParentPage.id);
                parentId = newParentPage.id;
              } else {
                parentId = pathToIdMap.get(parentPath);
              }
            }
          }

          // Create the current page
          const page = await EnvironmentPage.create(
            {
              environment_id: environment.id,
              name,
              path: fullPath,
              parent_id: parentId
            },
            { transaction: t }
          );
          pathToIdMap.set(fullPath, page.id);
          currPageId = page.id;
        }
      });
      console.log(`updated sitemap for ${environment.url}`);
      return currPageId;
    } catch (e) {
      console.log('Error updating environment page sitemap: ', e);
    }
  }

  /**
   * Creates test cases for a given environment test and list of pages.
   * @param {Object} input
   * @param {string} input.environment_test_id - ID of the environment test
   * @param {string[]} input.pages - IDs of the pages to create test cases for
   * @param {{}} [opt]
   * @throws Will throw an error if the environment test is not found.
   * @throws Will throw an error if no pages are found for the environment test.
   */
  static async createTestCases(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        environment_test_id: Joi.id().required(),
        pages: Joi.array().items(Joi.id()).required().min(1)
      })
    );
    const transaction = await sequelize.transaction();
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentPage = getModel('environmentPage'),
        TestCase = getModel('testCase'),
        TestCaseEnvironmentTestPage = getModel('testCaseEnvironmentTestPage');
      const pages = await EnvironmentPage.findAll({
        where: { id: data.pages },
        attributes: ['id'],
        include: [
          {
            model: getModel('environmentTest'),
            as: 'tests',
            attributes: ['id'],
            where: { id: data.environment_test_id },
            through: {
              attributes: []
            }
          }
        ],
        transaction
      });
      if (!pages) throw new Error('Environment test not found');
      if (!pages.length) throw new Error('No pages found for environment test');
      const selectedTestCases = await TestCase.findAll({
        where: {
          is_selected: true
        },
        transaction
      });
      const testCaseIds = selectedTestCases.map(tc => tc.id);
      const itemsToCreate = [];
      for (const page of pages) {
        for (const testCaseId of testCaseIds) {
          itemsToCreate.push({
            environment_test_id: data.environment_test_id,
            environment_page_id: page.id,
            test_case_id: testCaseId
          });
        }
      }
      await TestCaseEnvironmentTestPage.bulkCreate(itemsToCreate, { transaction });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      console.log('Error creating environment page test cases: ', e);
    }
  }

  /**
   * Finds test cases associated with a specific environment page and test.
   * @param {Object} input
   * @param {string} input.environment_page_id - id of the environment page to search.
   * @param {string} input.environment_test_id - id of the environment test to search.
   * @param {string} [input.status] - status of the test case
   * @param {string[]} [input.criteria] - additional search criteria
   * @param {'A' | 'AA' | 'AAA'} [input.level] - level of the criteria
   * @param {Object} [input.sort] - Sorting options for the results.
   * @param {string} [input.sort.field] - Field to sort by.
   * @param {string} [input.sort.direction] - Sorting direction (ASC or DESC).
   * @param {number} [input.page] - Page number for pagination.
   * @param {number} [input.limit] - Number of results per page.
   * @param {{}} [opt] - Additional options for the query.
   * @returns - Paginated list of test cases
   */
  static async findTestCases(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        environment_page_id: Joi.id().required(),
        environment_test_id: Joi.id().required(),
        status: Joi.enum(TEST_CASE_PAGE_STATUS_VALUES).optional().allow(''),
        criteria: Joi.array().items(Joi.string()).optional().allow(''),
        level: Joi.enum(STANDARD_CRITERIA_LEVELS).optional().allow(''),
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
      const TestCase = getModel('testCase');
      const where = {},
        environmentPageWhere = {},
        criteriaWhere = {},
        include = [],
        order = [];
      const hasSort = data.sort && data.sort.field && data.sort.direction;
      if (hasSort) {
        data.sort.direction = data.sort.direction.toUpperCase();
      }
      if (data.environment_page_id) {
        environmentPageWhere.environment_page_id = data.environment_page_id;
      }
      if (data.environment_test_id) {
        environmentPageWhere.environment_test_id = data.environment_test_id;
      }
      if (data.status) {
        environmentPageWhere.status = data.status;
      }
      if (data.criteria) {
        where['system_standard_criteria_id'] = {
          [Op.in]: data.criteria
        };
      }
      if (data.level) {
        criteriaWhere.level = data.level;
      }
      include.push({
        model: getModel('testCaseEnvironmentTestPage'),
        as: 'pages',
        where: { status: { [Op.ne]: 'NOT_APPLICABLE' }, ...environmentPageWhere },
        attributes: ['id', 'status']
      });
      include.push({
        model: getModel('systemStandardCriteria'),
        as: 'criteria',
        attributes: ['id', 'name', 'description', 'level', 'help_url'],
        where: criteriaWhere
      });

      // if end_date is null (test is not complete), then show MANUAL on top
      // else show FAIL on top, ...
      const defaultOrderClause = sequelize.literal(`(
            SELECT CASE
              WHEN etp.end_date IS NOT NULL THEN (
                CASE tcp.status
                  WHEN 'FAIL' THEN 0
                  WHEN 'PASS' THEN 1
                  WHEN 'INCOMPLETE' THEN 2
                  WHEN 'NOT_APPLICABLE' THEN 3
                  WHEN 'MANUAL' THEN 4
                  ELSE 5
                END
              )
              ELSE (
                CASE tcp.status
                  WHEN 'MANUAL' THEN 0
                  ELSE 1
                END
              )
            END
            FROM test_case_environment_test_pages AS tcp
            JOIN environment_pages AS ep ON tcp.environment_page_id = ep.id
            JOIN environment_test_pages AS etp ON etp.environment_page_id = ep.id
            WHERE tcp.test_case_id = testCase.id AND ep.id = '${data.environment_page_id}'
            LIMIT 1
          )`);
      if (hasSort) {
        if (data.sort.field === 'type') {
          order.push(['type', data.sort.direction]);
          order.push([sequelize.literal('CAST(SUBSTRING(`testCase`.id, 5) AS UNSIGNED)'), 'ASC']);
        } else if (data.sort.field === 'id') {
          order.push([sequelize.literal('CAST(SUBSTRING(`testCase`.id, 5) AS UNSIGNED)'), data.sort.direction]);
        } else if (data.sort.field === 'result') {
          order.push([defaultOrderClause, data.sort.direction]);
        } else {
          order.push([data.sort.field, data.sort.direction]);
        }
      } else {
        order.push([defaultOrderClause, 'ASC']);
      }
      const qry = CoreLib.paginateQuery({ include, order }, data, opt);
      const testCases = await TestCase.findAll(qry);
      const paginatedResults = CoreLib.paginateResult(testCases, data);
      paginatedResults.result = paginatedResults.result.map((item) => {
        item = fixTcTargets(item);
        const tests = item.pages;
        if (tests && tests.length > 0) {
          const status = tests[0].status;
          item.status = status;
          delete item.pages;
        }
        return item;
      });
      return paginatedResults;
    } catch (e) {
      console.log('Error reading environment page test cases: ', e);
    }
  }

  /**
   * Finds test case nodes associated with a specific environment page and test.
   * @param {Object} input
   * @param {string} [input.environment_page_id] - id of the environment page to search.
   * @param {string} input.environment_test_id - id of the environment test to search.
   * @param {string} [input.status] - test case node status.
   * @param {string[]} [input.criteria] - test case criteria.
   * @param {'A' | 'AA' | 'AAA'} [input.level] - level of the criteria
   * @param {boolean} [input.has_remediation] - weather or not to get only test case nodes that have a remediation
   * @param {Object} [input.sort] - Sorting options for the results.
   * @param {string} [input.sort.field] - Field to sort by.
   * @param {string} [input.sort.direction] - Sorting direction (ASC or DESC).
   * @param {number} [input.page] - Page number for pagination.
   * @param {number} [input.limit] - Number of results per page.
   * @param {Object} [opt] - Additional options for the query.
   * @param {boolean} [opt.count] - If true, also returns the count.
   * @returns - Paginated list of test case nodes.
   */
  static async findTestCaseNodes(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        environment_page_id: Joi.id().optional().allow(''),
        environment_test_id: Joi.id().required(),
        status: Joi.enum(TEST_CASE_PAGE_STATUS_VALUES).optional().allow(''),
        criteria: Joi.array().items(Joi.string()).optional().allow(''),
        level: Joi.enum(STANDARD_CRITERIA_LEVELS).optional().allow(''),
        landmarks: Joi.array().items(Joi.string()).optional().allow(''),
        has_remediation: Joi.boolean().optional().allow(''),
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
      const TestCaseEnvironmentTestPageTarget = getModel('testCaseEnvironmentTestPageTarget'),
        TestCase = getModel('testCase'),
        Remediation = getModel('remediation'),
        TestPageTargetOccurrence = getModel('testPageTargetOccurrence');
      const where = {},
        tcCriteriaWhere = {},
        tcWhere = {},
        include = [],
        order = [];
      const hasSort = !!(data.sort && data.sort.field && data.sort.direction);
      if (hasSort) {
        data.sort.direction = data.sort.direction.toUpperCase();
      }

      if (data.status) {
        where.status = data.status;
      } else {
        where.status = { [Op.ne]: 'NOT_APPLICABLE' };
      }

      if (data.criteria && data.criteria.length > 0) {
        tcCriteriaWhere.id = data.criteria;
      }

      if (data.level) {
        tcCriteriaWhere.level = data.level;
      }

      if (data.landmarks && data.landmarks.length > 0) {
        const landmarkNodes = await TestCaseEnvironmentTestPageTarget.findAll({
          where: {
            system_landmark_id: data.landmarks
          },
          attributes: ['id']
        });
        const landmarkNodeIds = landmarkNodes.map(node => node.id);
        if (!where[Op.or]) {
          where[Op.or] = [];
        }
        where[Op.or].push({
          system_landmark_id: data.landmarks
        }, {
          parent_landmark_id: landmarkNodeIds
        });
      }

      if (data.has_remediation) {
        where.remediation_id = { [Op.ne]: null };
      }

      if (Object.keys(tcCriteriaWhere).length > 0) {
        const tcs = await TestCase.findAll({
          include: [
            {
              model: getModel('systemStandardCriteria'),
              as: 'criteria',
              attributes: ['id', 'name', 'description', 'level', 'help_url'],
              required: true,
              where: tcCriteriaWhere,
              through: {
                attributes: []
              }
            }
          ]
        });
        const tcIds = tcs.map(tc => tc.id);
        tcWhere.test_case_id = tcIds;
      }

      include.push({
        model: getModel('testCaseEnvironmentTestPage'),
        as: 'test',
        attributes: ['id', 'status', 'test_case_id', 'environment_page_id', 'environment_test_id'],
        where: {
          environment_test_id: data.environment_test_id,
          ...(data.environment_page_id ? { environment_page_id: data.environment_page_id } : {}),
          ...tcWhere
        },
        include: [
          {
            model: TestCase,
            as: 'test_case',
            attributes: ['id', 'name', 'type', 'steps', 'result', 'instruction', 'selectors'],
            include: [
              {
                model: getModel('systemStandardCriteria'),
                as: 'criteria',
                attributes: ['id', 'name', 'description', 'level', 'help_url'],
                through: {
                  attributes: []
                }
              },
              {
                model: getModel('remediation'),
                as: 'remediations',
                attributes: ['id', 'name', 'description', 'selectors', 'is_selected'],
                where: {
                  is_selected: true
                },
                required: false,
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
              }
            ]
          },
          {
            model: getModel('environmentPage'),
            as: 'environment_page',
            attributes: ['id', 'name', 'path']
          }
        ]
      });
      include.push({
        model: getModel('remediation'),
        as: 'remediation',
        attributes: ['id', 'name', 'description', 'selectors', 'is_selected'],
        where: {
          is_selected: true
        },
        required: false,
        include: [
          {
            model: getModel('systemCategory'),
            as: 'category',
            attributes: ['id', 'name', 'priority']
          },
          {
            model: getModel('remediationExample'),
            as: 'examples',
            attributes: ['id', 'name', 'description', 'code']
          },
          {
            model: getModel('systemStandardCriteria'),
            as: 'criteria',
            attributes: ['id', 'name', 'help_url'],
            through: {
              attributes: []
            }
          }
        ]
      });
      include.push({
        model: getModel('systemLandmark'),
        as: 'landmark',
        attributes: ['id', 'name']
      });
      include.push({
        model: TestCaseEnvironmentTestPageTarget,
        as: 'parent_landmark',
        attributes: ['id', 'html']
      });

      if (hasSort) {
        if (data.sort.field === 'id') {
          order.push([sequelize.literal('CAST(SUBSTRING(`test.test_case_id`, 4) AS UNSIGNED)'), data.sort.direction]);
        } else if (data.sort.field === 'type') {
          order.push([
            { model: getModel('testCaseEnvironmentTestPage'), as: 'test' },
            { model: getModel('testCase'), as: 'test_case' },
            'type',
            data.sort.direction
          ]);
        } else if (data.sort.field === 'name') {
          order.push([{ model: getModel('remediation'), as: 'remediation' }, data.sort.field, data.sort.direction]);
        } else if (data.sort.field === 'category') {
          order.push([
            { model: getModel('remediation'), as: 'remediation' },
            { model: getModel('systemCategory'), as: 'category' },
            'name',
            data.sort.direction
          ]);
        } else if (data.sort.field === 'target') {
          order.push(['html', data.sort.direction]);
        } else if (data.sort.field === 'page') {
          order.push([
            { model: getModel('testCaseEnvironmentTestPage'), as: 'test' },
            { model: getModel('environmentPage'), as: 'environment_page' },
            'name',
            data.sort.direction
          ]);
        } else if (data.sort.field === 'relatedTargetCount') {
          order.push(['related_target_count', data.sort.direction]);
        } else if (data.sort.field === 'relatedRemediationCount') {
          order.push(['related_remediation_count', data.sort.direction]);
        } else {
          order.push([data.sort.field, data.sort.direction]);
        }
      } else {
        // by default, sort via occurrences
        if (data.has_remediation) {
          order.push(['related_remediation_count', 'DESC']);
        } else {
          order.push(['related_target_count', 'DESC']);
        }
      }

      const qry = CoreLib.paginateQuery({ where, include, order }, data, opt);
      let paginatedResults;
      if (opt.count) {
        const res = await TestCaseEnvironmentTestPageTarget.findAndCountAll({ ...qry, distinct: true });
        paginatedResults = CoreLib.paginateResult(res.rows, data);
        paginatedResults.meta.count = res.count;
      } else {
        const res = await TestCaseEnvironmentTestPageTarget.findAll(qry);
        paginatedResults = CoreLib.paginateResult(res, data);
      }

      let relatedTargets = await TestPageTargetOccurrence.findAll({
        where: {
          page_target_id: paginatedResults.result.map(r => r.id)
        },
        include: [
          {
            model: TestCaseEnvironmentTestPageTarget,
            as: 'related_page_target',
            attributes: ['id', 'status', 'remediation_id'],
            include: [
              {
                model: getModel('testCaseEnvironmentTestPage'),
                as: 'test',
                attributes: ['id'],
                include: [
                  {
                    model: getModel('environmentPage'),
                    as: 'environment_page',
                    attributes: ['id', 'name'],
                    required: false
                  }
                ]
              }
            ]
          }
        ]
      });
      relatedTargets = relatedTargets.map(r => r.toJSON());

      const remediations = await Remediation.findAll({
        include: [
          {
            model: getModel('systemCategory'),
            as: 'category',
            attributes: ['id', 'name', 'priority']
          },
          {
            model: getModel('systemStandardCriteria'),
            as: 'criteria',
            attributes: ['id'],
            through: {
              attributes: []
            }
          },
          {
            model: getModel('remediationExample'),
            as: 'examples',
            attributes: ['id', 'name', 'description', 'code']
          }
        ]
      });

      const criteriaRemMap = new Map();

      for (let rem of remediations) {
        rem = rem.toJSON();
        for (const criteria of rem.criteria) {
          if (!criteriaRemMap.has(criteria.id)) {
            criteriaRemMap.set(criteria.id, []);
          }
          criteriaRemMap.get(criteria.id).push(rem);
        }
      }

      paginatedResults.result.forEach((r) => {
        if (r.test.test_case) {
          if (r.test.test_case.remediations && r.test.test_case.remediations.length > 0) {
            r.test.test_case.remediations = r.test.test_case.remediations;
          } else {
            const allRelatedRems = new Map();
            const selectorRelatedRems = new Map();
            const testCriteria = r.test.test_case.criteria;
            for (const tCriterion of testCriteria) {
              const rems = criteriaRemMap.get(tCriterion.id);
              if (!rems) continue;
              for (const rem of rems) {
                if (!allRelatedRems.has(rem.id)) {
                  allRelatedRems.set(rem.id, rem);
                }
                if (r.test.test_case.selectors && r.test.test_case.selectors.length > 0) {
                  const hasMatch = r.test.test_case.selectors.some(item => rem.selectors.includes(item));
                  if (hasMatch) {
                    selectorRelatedRems.set(rem.id, rem);
                  }
                }
              }
            }
            const assignableRemMap = selectorRelatedRems.size > 0 ? selectorRelatedRems : allRelatedRems;
            r.test.test_case.remediations = Array.from(assignableRemMap.values());
          }
          r.test.test_case.remediations = r.test.test_case.remediations.sort((a, b) => b.category.priority - a.category.priority);
        }
        const relatedTargetsData = relatedTargets.filter(relatedTarget => relatedTarget.page_target_id === r.id);
        r.related_targets = relatedTargetsData.map(relatedTarget => relatedTarget.related_page_target) || [];
      });

      return paginatedResults;
    } catch (e) {
      console.log('Error reading environment page test cases: ', e);
    }
  }

  /**
   * finds a test case for a given environment page and test.
   * @param {Object} input
   * @param {string} input.environment_page_id - id of the environment page to search.
   * @param {string} input.environment_test_id - id of the environment test to search.
   * @param {string} input.test_case_id - id of the test case to search.
   * @param {{}} [opt]
   * @returns - the test case
   * @throws will throw an error if the environment test is not found.
   * @throws will throw an error if no pages are found for the environment test.
   */
  static async readTestCase(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        environment_page_id: Joi.id().required(),
        environment_test_id: Joi.id().required(),
        test_case_id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const TestCase = getModel('testCase');
      const testCase = await TestCase.findByPk(data.test_case_id, {
        include: [
          {
            model: getModel('testCaseEnvironmentTestPage'),
            as: 'pages',
            attributes: ['id', 'status'],
            where: { environment_page_id: data.environment_page_id, environment_test_id: data.environment_test_id }
          }
        ]
      });
      if (!testCase) {
        throw new Error('Test case not found');
      }
      return fixTcTargets(testCase.toJSON());
    } catch (e) {
      console.log('Error reading environment\'s test case: ', e);
    }
  }

  /**
   * finds an environment test for a given environment page and test.
   * @param {Object} input
   * @param {string} input.environment_page_id - id of the environment page to search.
   * @param {string} input.environment_test_id - id of the environment test to search.
   * @param {{}} [opt]
   * @returns - the environment page with environment test data
   * @throws will throw an error if the environment test is not found.
   */
  static async findEnvironmentTest(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        environment_page_id: Joi.id().required(),
        environment_test_id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentPage = getModel('environmentPage');
      const environmentTestPageObj = await EnvironmentPage.findByPk(data.environment_page_id, {
        include: [
          {
            model: getModel('environmentTest'),
            as: 'tests',
            attributes: ['id', 'name', 'status'],
            where: { id: data.environment_test_id },
            through: {
              attributes: ['page_type', 'start_date', 'end_date']
            }
          }
        ]
      });
      if (!environmentTestPageObj || !environmentTestPageObj.tests || environmentTestPageObj.tests.length === 0) {
        throw new Error('Environment test not found');
      }
      let environmentTestPage = environmentTestPageObj.toJSON();
      environmentTestPage.test = environmentTestPage.tests[0];
      environmentTestPage = { ...environmentTestPage, ...environmentTestPage.test.environmentTestPage };
      delete environmentTestPage.tests;
      delete environmentTestPage.test.environmentTestPage;
      return environmentTestPage;
    } catch (e) {
      console.log('Error finding environment test: ', e);
    }
  }

  /**
   * Updates the target of an environment test.
   * @param {Object} input
   * @param {string} input.id - ID of the test target to update.
   * @param {string} [input.status] - New status for the test target.
   * @param {string} [input.notes] - Additional notes for the test target.
   * @param {string} [input.remediation_id] - ID of the remediation to associate with the test target.
   * @param {{}} [opt]
   * @throws Will throw an error if the test target is not found.
   */
  static async updateEnvironmentTestTarget(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required(),
        status: Joi.enum(TEST_CASE_PAGE_STATUS_VALUES).optional().allow(''),
        notes: Joi.string().optional().allow(''),
        remediation_id: Joi.string().optional().allow('')
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const TestCaseEnvironmentTestPageTarget = getModel('testCaseEnvironmentTestPageTarget'),
        EnvironmentTest = getModel('environmentTest');
      const target = await TestCaseEnvironmentTestPageTarget.findByPk(data.id, {
        include: [
          {
            model: getModel('testCaseEnvironmentTestPage'),
            as: 'test',
            attributes: ['id', 'environment_test_id']
          },
          {
            model: TestCaseEnvironmentTestPageTarget,
            as: 'related_targets',
            attributes: ['id', 'status', 'remediation_id'],
            through: {
              attributes: []
            }
          }
        ]
      });
      if (!target) {
        throw new Error('Environment test target not found');
      }
      const dataToUpdate = {};
      const relatedTargets = target.related_targets?.filter(t => t.status === target.status) || [];
      const relatedTargetIds = relatedTargets.map(t => t.id);
      const allIds = [target.id, ...relatedTargetIds];
      if (data.status) {
        dataToUpdate.status = data.status;
        if (data.status === 'INCOMPLETE') {
          dataToUpdate.remediation_id = null;
        }
      }
      if (data.notes !== undefined) {
        dataToUpdate.notes = data.notes;
      }
      if (data.remediation_id) {
        const relatedRemTargets = relatedTargets.filter(t => t.remediation_id === target.remediation_id);
        const relatedRemTargetIds = relatedRemTargets.map(t => t.id);
        const allRemTargetIds = [target.id, ...relatedRemTargetIds];
        const occurrences = relatedRemTargets.length;
        await bulkUpdateColumn(allRemTargetIds.map(id => ({ id, value: occurrences })), TestCaseEnvironmentTestPageTarget.getTableName(), 'related_remediation_count');
        dataToUpdate.remediation_id = data.remediation_id;
      }
      await TestCaseEnvironmentTestPageTarget.update(dataToUpdate, {
        where: {
          id: allIds
        }
      });
      const needsManualCheck = await EnvironmentTestLib.doesTestNeedManualCheck({ id: target.test.environment_test_id });
      const envTestObj = await EnvironmentTest.findByPk(target.test.environment_test_id);
      if (!needsManualCheck && envTestObj.status !== 'COMPLETED') {
        envTestObj.status = 'COMPLETED';
      } else if (needsManualCheck && envTestObj.status === 'COMPLETED') {
        envTestObj.status = 'IN_PROGRESS';
      }
      await envTestObj.save();
    } catch (e) {
      console.log('Error updating environment test target: ', e);
    }
  }

  /**
   * Generates a CSV report for an environment page.
   * @param {Object} input
   * @param {string} input.environment_page_id - ID of the environment page.
   * @param {string} input.environment_test_id - ID of the environment test.
   * @param {{}} [opt]
   * @param {boolean} [opt.is_remediation_report] - If true, generates a CSV report for remediations.
   * @returns - The data in CSV format.
   * @throws will throw an error if the environment test is not found.
   */
  static async generateReport(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        environment_page_id: Joi.id().required(),
        environment_test_id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      let result,
        headings = [];

      const STATUS_PRIORITIES = {
        FAIL: 1,
        INCOMPLETE: 2,
        MANUAL: 3
      };

      const EnvironmentTest = getModel('environmentTest');

      const envTest = await EnvironmentTest.findByPk(data.environment_test_id, {
        attributes: ['id', 'name']
      });

      if (!envTest) {
        throw new Error('Environment Test not found');
      }

      const testsRes = await this.findTestCaseNodes({
        environment_page_id: data.environment_page_id,
        environment_test_id: data.environment_test_id,
        has_remediation: opt.is_remediation_report,
        limit: false
      });
      const hasOccurrenceData = await EnvironmentTestLib.hasOccurrenceData({ id: data.environment_test_id });
      const tests = testsRes.result;
      if (opt.is_remediation_report) {
        headings = [
          'Remediation Code',
          ...(hasOccurrenceData ? ['Occurrences'] : []),
          'Remediation Name',
          'Remediation Description / Instructions / Steps',
          'Remediation Category',
          'Target HTML',
          'Target Selector',
          'Target Selector used',
          'Test Notes',
          'Test Case Code',
          'Test Case Name',
          'Test Case Steps',
          'Test Case Result',
          'Test Case Type',
          'Test Case Criteria'
        ];
        result = tests.map((test) => {
          const remediation = test.remediation;
          const testCase = test.test.test_case;
          return [
            remediation.id,
            ...(hasOccurrenceData ? [(test.related_remediation_count || 0) + 1] : []),
            remediation.name || '',
            remediation.description || '',
            remediation.category?.name || '',
            test.html || '',
            test.selector || '',
            test.selector_used || '',
            test.notes || '',
            testCase.id || '',
            testCase.name || '',
            testCase.steps || '',
            testCase.result || '',
            strToCase(testCase.type || '', 'capitalized'),
            testCase.criteria.map(c => c.id).join('\n')
          ];
        });
      } else {
        headings = [
          'Test Status',
          'Test Type',
          'Test Case Code',
          'Test Case Name',
          ...(hasOccurrenceData ? ['Occurrences'] : []),
          'Target HTML',
          'Target Selector',
          'Target Selector used',
          'Test Notes',
          'Test Case Steps',
          'Test Case Expected Result',
          'Test Case Criterion',
          'Remediation Code',
          'Remediation Name',
          'Remediation Description',
          'Remediation Category'
        ];
        result = tests.sort((a, b) => {
          const aPriority = STATUS_PRIORITIES[a.status] || 99;
          const bPriority = STATUS_PRIORITIES[b.status] || 99;
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          return b.related_target_count - a.related_target_count;
        }).map((test) => {
          const remediation = test.remediation;
          const testCase = test.test.test_case;
          return [
            test.status || '',
            strToCase(testCase.type || '', 'capitalized'),
            testCase.id || '',
            testCase.name || '',
            ...(hasOccurrenceData ? [(test.related_target_count || 0) + 1] : []),
            test.html || '',
            test.selector || '',
            test.selector_used || '',
            test.notes || '',
            testCase.steps || '',
            testCase.result || '',
            testCase.criteria.map(c => c.id).join('\n'),
            remediation?.id || '',
            remediation?.name || '',
            remediation?.description || '',
            remediation?.category?.name || ''
          ];
        });
      }
      const csvFormat = [headings, ...result].map(row => row.map(escapeCSV).join(',')).join('\n');
      return { csv: csvFormat, name: `${opt.is_remediation_report ? 'remediations' : 'test-cases'}-${envTest.name}-${formatDate(new Date(), 'yyyy-MM-dd')}` };
    } catch (e) {
      console.log('Error generating CSV: ', e);
    }
  }
}

const createLabel = pathSegment =>
  pathSegment
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word

function escapeCSV(value) {
  if (value == null) return '';
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export default EnvironmentPageLib;
