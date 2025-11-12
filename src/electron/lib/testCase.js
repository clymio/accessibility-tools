import Joi from 'joi';
import { literal, Op } from 'sequelize';
import { TEST_CASE_TYPE_VALUES } from '../db/models/testCase';
import CoreLib from './core';
import sequelize, { getModel } from './db';
import joiLib from './joi';
import { generateId } from './utils';

class TestCaseLib {
  /**
   * Creates a test case.
   * @param {Object} input
   * @param {string} input.name - Name of the test case
   * @param {string} [input.type] - Type of the test case (MANUAL, AUTOMATIC)
   * @param {string} [input.steps] - Steps to execute the test case
   * @param {string} [input.result] - Result of the test case
   * @param {string} [input.instruction] - Instruction to execute the test case
   * @param {string} [input.selectors] - Selectors for the test case
   * @param {string} input.system_standard_id - id of the system standard
   * @param {string} input.system_standard_criteria - array of ids for the system standard criteria
   * @param {string} [input.system_category_id] - id of the system category
   * @param {string[]} [input.remediations] - array of ids of remediations
   * @param {Object} [opt]
   * @param {boolean} [opt.is_system] - Whether the test case is a system test case
   * @return {Promise<Object>} - Test case object
   */
  static async create(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        name: Joi.string().required(),
        type: Joi.enum(TEST_CASE_TYPE_VALUES).optional().allow(null),
        steps: Joi.string().optional().allow(null, ''),
        result: Joi.string().optional().allow(null, ''),
        instruction: Joi.string().optional().allow(null, ''),
        selectors: Joi.string().optional().allow(null, ''),
        system_standard_id: Joi.string().required(),
        system_standard_criteria: Joi.array().items(Joi.string()).required().min(1),
        system_category_id: Joi.string().optional().default('F'),
        remediations: Joi.array().items(Joi.string()).optional(),
        axe_rules: Joi.array().items(Joi.string()).optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const TestCase = getModel('testCase');
      const evaluateTestCaseId = async () => {
        const INITIAL_ID = 1;
        const standardInfo = `${data.system_standard_id[0]}`;
        const idPrefix = opt.is_system ? `S${standardInfo}-1` : `USR${standardInfo}-1`;
        const testCases = await TestCase.findAll({
          order: [['id', 'DESC']]
        });
        const filteredTestCases = testCases.filter(p => p.id.startsWith(idPrefix));
        if (filteredTestCases.length === 0) {
          return generateId(INITIAL_ID, idPrefix);
        }
        const lastTestCase = filteredTestCases[0];
        const idNumber = parseInt(lastTestCase.id.substring(idPrefix.length));
        return generateId(idNumber + 1, idPrefix);
      };
      const testCaseId = data.id || (await evaluateTestCaseId());
      if (data.selectors) {
        data.selectors = data.selectors
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean);
      }
      const testCase = await TestCase.create(
        {
          id: testCaseId,
          name: data.name,
          type: data.type,
          steps: data.steps,
          result: data.result,
          instruction: data.instruction,
          selectors: data.selectors,
          system_standard_id: data.system_standard_id,
          system_category_id: data.system_category_id,
          is_selected: true
        },
        { transaction }
      );
      if (data.system_standard_criteria && data.system_standard_criteria.length > 0) {
        await testCase.setCriteria(data.system_standard_criteria, { transaction });
      }
      if (data.remediations && data.remediations.length > 0) {
        await testCase.setRemediations(data.remediations, { transaction });
      }
      if (data.axe_rules && data.axe_rules.length > 0) {
        await testCase.setRules(data.axe_rules, { transaction });
      }
      await transaction.commit();
      const updatedTestCaseObj = await this.read({ id: testCaseId });
      return updatedTestCaseObj;
    } catch (e) {
      await transaction.rollback();
      console.log('Error creating test case:', input.id, e);
    }
  }

  /**
   * Finds test cases based on filters.
   * @param {Object} input
   * @param {string} [input.id] - Specific test case id to find
   * @param {string} [input.search] - Search term for matching test case names
   * @param {string} [input.type] - Type of test case (MANUAL, AUTOMATIC)
   * @param {boolean} [input.is_selected] - Whether the test case is selected
   * @param {string[]} [input.system_standards] - Array of system standard IDs
   * @param {string[]} [input.system_standard_versions] - Array of system standard version IDs
   * @param {string[]} [input.system_standard_principles] - Array of system standard principle IDs
   * @param {string[]} [input.system_standard_guidelines] - Array of system standard guideline IDs
   * @param {string[]} [input.system_standard_criteria] - Array of system standard criteria IDs
   * @param {string[]} [input.remediations] - Array of ids of remediations
   * @param {string[]} [input.axe_rules] - Array of ids of axe rules
   * @param {number} [input.page] - Page number for pagination
   * @param {number} [input.limit] - Number of results per page
   * @param {Object} [opt]
   * @param {boolean} [opt.detailed] - Whether to return detailed test case information
   * @return {Promise<Object[]>} - Paginated list of test cases matching the criteria
   */
  static async find(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        search: Joi.metaSearch(),
        type: Joi.enum(TEST_CASE_TYPE_VALUES).optional(),
        is_selected: Joi.boolean().optional(),
        selectors: Joi.array().items(Joi.string()).optional(),
        system_standards: Joi.array().items(Joi.string()).optional(),
        system_standard_versions: Joi.array().items(Joi.string()).optional(),
        system_standard_principles: Joi.array().items(Joi.string()).optional(),
        system_standard_guidelines: Joi.array().items(Joi.string()).optional(),
        system_standard_criteria: Joi.array().items(Joi.string()).optional(),
        remediations: Joi.array().items(Joi.string()).optional(),
        axe_rules: Joi.array().items(Joi.string()).optional(),
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
        where[Op.or] = [{ name: { [Op.like]: `%${data.search}%` } }, { id: { [Op.like]: `%${data.search}%` } }];
      }
      if (data.type) {
        where.type = data.type;
      }
      if (data.is_selected !== undefined) {
        where.is_selected = data.is_selected;
      }
      if (data.selectors && data.selectors.length > 0) {
        data.selectors = data.selectors.map(s => s.trim()).filter(Boolean);
        const testCases = await TestCase.findAll({
          where: literal(`
            EXISTS (
              SELECT 1
              FROM json_each(selectors)
              WHERE json_each.value IN (${data.selectors.map(s => '?').join(', ')})
            )
          `),
          replacements: data.selectors
        });
        const testCaseIds = testCases.map(tc => tc.id);
        if (!where[Op.or]) {
          where[Op.or] = [];
        }
        where[Op.or].push({ id: testCaseIds });
      }
      if (data.system_standards && data.system_standards.length > 0) {
        where['system_standard_id'] = {
          [Op.in]: data.system_standards
        };
      }
      if (data.system_standard_criteria && data.system_standard_criteria.length > 0) {
        const testCase = await TestCase.findAll({
          include: {
            model: getModel('systemStandardCriteria'),
            as: 'criteria',
            where: {
              id: data.system_standard_criteria
            }
          }
        });
        const testCaseIds = testCase.map(tc => tc.id);
        if (!where[Op.or]) {
          where[Op.or] = [];
        }
        where[Op.or].push({ id: testCaseIds });
      }
      if (data.remediations && data.remediations.length > 0) {
        const testCase = await TestCase.findAll({
          include: {
            model: getModel('remediation'),
            as: 'remediation',
            where: {
              id: data.remediations
            }
          }
        });
        const testCaseIds = testCase.map(tc => tc.id);
        if (!where[Op.or]) {
          where[Op.or] = [];
        }
        where[Op.or].push({ id: testCaseIds });
      }
      if (data.axe_rules && data.axe_rules.length > 0) {
        const testCase = await TestCase.findAll({
          include: {
            model: getModel('systemAxeRules'),
            as: 'rules',
            where: {
              id: data.axe_rules
            }
          }
        });
        const testCaseIds = testCase.map(tc => tc.id);
        if (!where[Op.or]) {
          where[Op.or] = [];
        }
        where[Op.or].push({ id: testCaseIds });
      }

      if (hasSort) {
        if (data.sort.field === 'standard') {
          const firstPartOrder = sequelize.literal(`(
              SELECT CAST(SUBSTR("criteria"."id", 1, INSTR("criteria"."id", '.') - 1) AS INTEGER)
              FROM "system_standard_criteria" AS "criteria"
              JOIN "test_case_criteria" AS "testCaseCriteria"
              WHERE "testCase"."id" = "testCaseCriteria"."test_case_id"
                AND "criteria"."id" = "testCaseCriteria"."system_standard_criteria_id"
            )`);
          const secondPartOrder = sequelize.literal(`(
              SELECT CAST(SUBSTR(
                  "criteria"."id",
                  INSTR("criteria"."id", '.') + 1,
                  INSTR(SUBSTR("criteria"."id", INSTR("criteria"."id", '.') + 1), '.') - 1
                ) AS INTEGER)
              FROM "system_standard_criteria" AS "criteria"
              JOIN "test_case_criteria" AS "testCaseCriteria"
              WHERE "testCase"."id" = "testCaseCriteria"."test_case_id"
                AND "criteria"."id" = "testCaseCriteria"."system_standard_criteria_id"
            )`);
          const thirdPartOrder = sequelize.literal(`(
            SELECT CAST(SUBSTR(
                "criteria"."id",
                INSTR("criteria"."id", '.') + INSTR(SUBSTR("criteria"."id", INSTR("criteria"."id", '.') + 1), '.') + 1
              ) AS INTEGER)
            FROM "system_standard_criteria" AS "criteria"
            JOIN "test_case_criteria" AS "testCaseCriteria"
            WHERE "testCase"."id" = "testCaseCriteria"."test_case_id"
              AND "criteria"."id" = "testCaseCriteria"."system_standard_criteria_id"
          )`);
          order.push([firstPartOrder, data.sort.direction]);
          order.push([secondPartOrder, data.sort.direction]);
          order.push([thirdPartOrder, data.sort.direction]);
        } else if (data.sort.field === 'id') {
          order.push([sequelize.literal('CASE WHEN `testCase`.id LIKE "USR%" THEN 0 ELSE 1 END'), data.sort.direction]);
          order.push([sequelize.literal('CAST(SUBSTRING(`testCase`.id, 6) AS UNSIGNED)'), data.sort.direction]);
        } else {
          order.push([data.sort.field, data.sort.direction]);
        }
      } else {
        order.push(
          [sequelize.literal('CASE WHEN `testCase`.id LIKE "USR%" THEN 0 ELSE 1 END'), 'ASC'], // USR shows up before S
          [sequelize.literal('CASE WHEN `testCase`.id LIKE "USR%" THEN CAST(SUBSTRING(`testCase`.id, 6) AS UNSIGNED) END'), 'DESC'], // USR sorted numerically descending
          [sequelize.literal('CASE WHEN `testCase`.id LIKE "S%" THEN CAST(SUBSTRING(`testCase`.id, 4) AS UNSIGNED) END'), 'ASC'] // S sorted numerically ascending
        );
      }

      if (opt.detailed) {
        include.push({
          model: getModel('systemStandard'),
          as: 'standard',
          attributes: ['id', 'name']
        });
        include.push({
          model: getModel('systemStandardCriteria'),
          as: 'criteria',
          attributes: ['id', 'name', 'description', 'level', 'help_url'],
          through: {
            attributes: []
          },
          include: [
            {
              model: getModel('systemStandardVersion'),
              as: 'versions',
              attributes: ['id', 'name']
            }
          ]
        });
        include.push({
          model: getModel('remediation'),
          as: 'remediations',
          attributes: ['id', 'name'],
          through: {
            attributes: []
          }
        });
        include.push({
          model: getModel('systemAxeRules'),
          as: 'rules',
          attributes: ['id'],
          through: {
            attributes: []
          }
        });
      }

      const qry = CoreLib.paginateQuery(
        {
          where,
          include,
          order
        },
        data,
        opt
      );
      let paginatedResults;
      if (opt.count) {
        const res = await TestCase.findAndCountAll({ ...qry, distinct: true });
        paginatedResults = CoreLib.paginateResult(res.rows, data);
        paginatedResults.meta.count = res.count;
      } else {
        const res = await TestCase.findAll(qry);
        paginatedResults = CoreLib.paginateResult(res, data);
      }
      paginatedResults.result = paginatedResults.result.map(item => ({
        ...item,
        selectors: item.selectors ? item.selectors.join('\n') : ''
      }));
      if (!opt.detailed) return paginatedResults;
      const totalCount = await TestCase.count();
      if (paginatedResults.meta) {
        paginatedResults.meta.total_count = totalCount;
      }
      paginatedResults.result = paginatedResults.result.map((item) => {
        const criteriaIds = item.criteria.map(c => c.id);
        const criteriaText = criteriaIds.length > 1 ? criteriaIds.slice(0, -1).join(', ') + ' and ' + criteriaIds.at(-1) : criteriaIds.join('');
        const description = `This test case is associated to ${item.standard.name} criteria ${criteriaText}.`;
        return {
          ...item,
          description
        };
      });
      return paginatedResults;
    } catch (e) {
      console.log('Error finding test cases: ', e);
    }
  }

  /**
   * Reads a single test case by id.
   * @param {Object} input
   * @param {string} input.id - id of the test case to read
   * @param {{}} [opt]
   * @return {Promise<Object>} - The test case object
   * @throws Will throw an error if the test case is not found
   */
  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const TestCase = getModel('testCase');
      const testCase = await TestCase.findByPk(data.id, {
        include: [
          {
            model: getModel('systemStandard'),
            as: 'standard',
            attributes: ['id', 'name']
          },
          {
            model: getModel('systemStandardCriteria'),
            as: 'criteria',
            attributes: ['id', 'name']
          },
          {
            model: getModel('remediation'),
            as: 'remediations',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ]
      });
      if (!testCase) {
        throw new Error('Test case not found');
      }
      testCase.selectors = testCase.selectors ? testCase.selectors.join('\n') : '';
      return testCase.toJSON();
    } catch (e) {
      console.log('Error reading test case: ', e);
    }
  }

  /**
   * Updates a test case
   * @param {Object} input
   * @param {string} input.id - id of the test case to update.
   * @param {string} [input.name] - New name of the test case.
   * @param {string} [input.type] - New type of the test case (MANUAL, AUTOMATIC).
   * @param {string} [input.steps] - New steps to execute the test case.
   * @param {string} [input.result] - New result of the test case execution.
   * @param {string} [input.instruction] - New instruction to execute the test case.
   * @param {string} [input.selectors] - New selectors for the test case.
   * @param {boolean} [input.is_selected] - Whether the test case is selected.
   * @param {string} [input.system_standard_id] - id of the new system standard.
   * @param {string} [input.system_standard_criteria] - ids of the new system standard criteria.
   * @param {string} [system_category_id] - id of the system category.
   * @param {string[]} [input.remediations] - Array of new remediations
   * @param {{}} [opt]
   * @return {Promise<Object>} - The updated test case object.
   * @throws Will throw an error if the test case is not found
   *
   */
  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().optional(),
        type: Joi.enum(TEST_CASE_TYPE_VALUES).optional().allow(null),
        steps: Joi.string().optional().allow(null, ''),
        result: Joi.string().optional().allow(null, ''),
        instruction: Joi.string().optional().allow(null, ''),
        selectors: Joi.string().optional().allow(null, ''),
        is_selected: Joi.boolean().optional(),
        system_standard_id: Joi.string().optional().allow(null, ''),
        system_standard_criteria: Joi.array().items(Joi.string()).optional(),
        system_category_id: Joi.string().optional().allow(null, ''),
        remediations: Joi.array().items(Joi.string()).optional(),
        axe_rules: Joi.array().items(Joi.string()).optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const TestCase = getModel('testCase');
      const testCase = await TestCase.findByPk(data.id);
      if (!testCase) throw new Error('test case not found');
      if (data.name) {
        testCase.name = data.name;
      }
      if (data.type) {
        testCase.type = data.type;
      }
      if (data.steps !== undefined) {
        testCase.steps = data.steps;
      }
      if (data.result !== undefined) {
        testCase.result = data.result;
      }
      if (data.instruction !== undefined) {
        testCase.instruction = data.instruction;
      }
      if (data.selectors !== undefined) {
        testCase.selectors = data.selectors
          ? data.selectors
            .split('\n')
            .map(selector => selector.trim())
            .filter(Boolean)
          : [];
      }
      if (data.system_standard_id) {
        testCase.system_standard_id = data.system_standard_id;
      }
      if (data.system_category_id) {
        testCase.system_category_id = data.system_category_id;
      }
      if (data.is_selected !== undefined) {
        testCase.is_selected = data.is_selected;
      }
      if (data.system_standard_criteria) {
        await testCase.setCriteria(data.system_standard_criteria, { transaction });
      }
      if (data.remediations) {
        await testCase.setRemediations(data.remediations, { transaction });
      }
      if (data.axe_rules && data.axe_rules.length > 0) {
        await testCase.setRules(data.axe_rules, { transaction });
      }
      await testCase.save({ transaction });
      await transaction.commit();
      return this.read({ id: testCase.id });
    } catch (e) {
      await transaction.rollback();
      console.log('Error updating test case: ', e);
    }
  }

  /**
   * Update multiple test cases as selected or unselected.
   * @param {Object} input
   * @param {string[]} input.ids
   * @param {boolean} input.is_selected
   * @param {{}} [opt]
   * @return {Promise<void>}
   * @throws Will throw an error if there is an issue updating the test cases
   */
  static async updateIsSelected(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        ids: Joi.array().items(Joi.string()).required(),
        is_selected: Joi.boolean().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const TestCase = getModel('testCase');
      await TestCase.update({ is_selected: data.is_selected }, { where: { id: data.ids } });
    } catch (e) {
      console.log('Error updating test cases: ', e);
    }
  }

  /**
   * Delete a test case by id.
   * @param {{id: string}} input - the id of the test case
   * @param {{}} [opt]
   * @return {Promise<void>}
   * @throws Will throw an error if the test case is not found
   */
  static async delete(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const TestCase = getModel('testCase');
      const testCase = await TestCase.findByPk(data.id);
      if (!testCase) throw new Error('test case not found');
      await testCase.destroy();
    } catch (e) {
      console.log('Error deleting test case: ', e);
    }
  }
}

export default TestCaseLib;
