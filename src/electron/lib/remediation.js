import Joi from 'joi';
import { literal, Op } from 'sequelize';
import CoreLib from './core';
import sequelize, { getModel } from './db';
import joiLib from './joi';
import { generateId } from './utils';

class RemediationLib {
  /**
   * Creates a new remediation entry in the database.
   * @param {Object} input
   * @param {string} [input.id] - The ID of the remediation
   * @param {string} input.name - The name of the remediation
   * @param {string} [input.description] - A description of the remediation
   * @param {string} [input.selectors] - The selectors for the remediation
   * @param {string[]} [input.test_cases] - An array of test case IDs
   * @param {string} input.system_category_id - The ID of the system category
   * @param {string[]} input.system_criteria - An array of system criteria
   * @param {Object[]} [input.examples] - An array of example objects
   * @param {string} [input.examples.id] - The ID of the example
   * @param {string} input.examples.name - The name of the example
   * @param {string} [input.examples.description] - The description of the example
   * @param {string} input.examples.code - The code of the example
   * @param {Object} [opt]
   * @param {boolean} [opt.is_system] - Whether the remediation is a system remediation
   * @return - the remediation object
   */
  static async create(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        name: Joi.string().required(),
        description: Joi.string().optional().allow(''),
        selectors: Joi.string().optional().allow(''),
        test_cases: Joi.array().items(Joi.string()).optional(),
        system_category_id: Joi.string().required(),
        system_criteria: Joi.array().items(Joi.string()).required(),
        examples: Joi.array()
          .items(
            Joi.object({
              id: Joi.string().optional().allow(''),
              name: Joi.string().required(),
              description: Joi.string().optional().allow(''),
              code: Joi.string().optional().allow('')
            })
          )
          .optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const Remediation = getModel('remediation');
      const evaluateId = async () => {
        const INITIAL_ID = 1;
        const idPrefix = opt.is_system ? 'SYS_REM_1' : 'USR_REM_1';
        const remediations = await Remediation.findAll({
          order: [['id', 'DESC']]
        });
        const filteredRemediations = remediations.filter(r => r.id.startsWith(idPrefix));
        if (filteredRemediations.length === 0) {
          return generateId(INITIAL_ID, idPrefix);
        }
        const lastRemediation = filteredRemediations[0];
        const idNumber = parseInt(lastRemediation.id.substring(idPrefix.length));
        return generateId(idNumber + 1, idPrefix);
      };
      const remId = data.id || await evaluateId();
      if (data.selectors) {
        data.selectors = data.selectors.split('\n').map(s => s.trim()).filter(Boolean);
      }
      const remediation = await Remediation.create(
        {
          id: remId,
          name: data.name,
          description: data.description,
          selectors: data.selectors,
          system_category_id: data.system_category_id
        },
        { transaction }
      );
      if (data.system_criteria && data.system_criteria.length > 0) {
        await remediation.setCriteria(data.system_criteria, { transaction });
      }
      if (data.test_cases && data.test_cases.length > 0) {
        await remediation.setTest_cases(data.test_cases, { transaction });
      }
      if (data.examples && data.examples.length > 0) {
        const exampleData = [];
        const RemediationExample = getModel('remediationExample');
        for (const example of data.examples) {
          exampleData.push({
            id: example.id,
            name: example.name,
            description: example.description,
            code: example.code,
            remediation_id: remediation.id
          });
        }
        await RemediationExample.bulkCreate(exampleData, { transaction });
      }
      await transaction.commit();
      return this.read({ id: remediation.id });
    } catch (e) {
      await transaction.rollback();
      console.log('Error creating remediation: ', e);
    }
  }

  /**
   * Finds remediation entries based on the provided filters.
   * @param {Object} input
   * @param {string} [input.id] - The specific remediation ID to find.
   * @param {string} [input.search] - Search term for matching remediation names.
   * @param {boolean} [input.is_selected] - Whether the remediation is selected or not.
   * @param {string[]} [input.system_categories] - Array of system category IDs to filter by.
   * @param {string[]} [input.system_standard_criteria] - Array of system standard criteria IDs to filter by.
   * @param {string[]} [input.test_cases] - Array of test case IDs to filter by.
   * @param {Object} [input.sort] - Sorting options for the results.
   * @param {string} [input.sort.field] - Field to sort by.
   * @param {string} [input.sort.direction] - Sorting direction (ASC or DESC).
   * @param {number} [input.page] - The page number for pagination.
   * @param {number} [input.limit] - Number of results per page.
   * @param {Object} [opt]
   * @param {boolean} [opt.detailed] - Whether to return detailed remediation information.
   * @returns {Promise<Object[]>} - Paginated list of remediation objects matching the criteria.
   */
  static async find(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        search: Joi.metaSearch(),
        is_selected: Joi.boolean().optional(),
        selectors: Joi.array().items(Joi.string()).optional(),
        system_categories: Joi.array().items(Joi.string()).optional(),
        system_standard_criteria: Joi.array().items(Joi.string()).optional(),
        test_cases: Joi.array().items(Joi.string()).optional(),
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
      const where = {},
        include = [],
        order = [],
        testCaseWhere = {};
      const Remediation = getModel('remediation');
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
      if (data.is_selected) {
        where.is_selected = data.is_selected;
      }
      if (data.selectors) {
        data.selectors = data.selectors.map(s => s.trim()).filter(Boolean);
        const remediations = await Remediation.findAll({
          where: literal(`
                      EXISTS (
                        SELECT 1
                        FROM json_each(selectors)
                        WHERE json_each.value IN (${data.selectors.map(s => '?').join(', ')})
                      )
                    `),
          replacements: data.selectors
        });
        const remediationIds = remediations.map(r => r.id);
        if (!where[Op.or]) {
          where[Op.or] = [];
        }
        where[Op.or].push({ id: remediationIds });
      }
      if (data.system_categories && data.system_categories.length > 0) {
        where['system_category_id'] = {
          [Op.in]: data.system_categories
        };
      }
      if (data.system_standard_criteria && data.system_standard_criteria.length > 0) {
        const TestCase = getModel('testCase');
        const testCases = await TestCase.findAll({
          include: [{
            model: getModel('systemStandardCriteria'),
            as: 'criteria',
            where: {
              id: data.system_standard_criteria
            }
          }]
        });
        if (!testCaseWhere[Op.or]) {
          testCaseWhere[Op.or] = [];
        }
        const testCaseIds = testCases.map(t => t.id);
        testCaseWhere[Op.or].push({ id: testCaseIds });
      }
      if (data.test_cases) {
        if (!testCaseWhere[Op.or]) {
          testCaseWhere[Op.or] = [];
        }
        testCaseWhere[Op.or].push({ id: data.test_cases });
      }
      if (hasSort) {
        const { field, direction } = data.sort;
        if (field === 'category') {
          order.push([sequelize.literal(`(SELECT name FROM ${getModel('systemCategory').tableName} WHERE id = 'remediation'.system_category_id)`), direction]);
        } else if (field === 'criteria') {
          order.push([
            sequelize.literal(`(
              SELECT "criteria"."id"
              FROM "system_standard_criteria" AS "criteria"
              INNER JOIN "remediation_criteria" AS "rc" ON "rc"."system_standard_criteria_id" = "criteria"."id"
              WHERE "rc"."remediation_id" = "remediation"."id"
              ORDER BY "criteria"."id" ${direction}
              LIMIT 1
            )`),
            direction
          ]);
        } else if (field === 'testCase') {
          order.push([{ model: getModel('testCase'), as: 'test_cases' }, 'name', direction]);
        } else if (data.sort.field === 'id') {
          order.push([sequelize.literal('CASE WHEN `remediation`.id LIKE "USR%" THEN 0 ELSE 1 END'), data.sort.direction]);
          order.push([sequelize.literal('CAST(SUBSTRING(`remediation`.id, 9) AS UNSIGNED)'), data.sort.direction]);
        } else {
          order.push([field, direction]);
        }
      } else {
        order.push(
          [sequelize.literal('CASE WHEN `remediation`.id LIKE "USR%" THEN 0 ELSE 1 END'), 'ASC'], // USR shows up before SYS
          [sequelize.literal('CASE WHEN `remediation`.id LIKE "USR%" THEN CAST(SUBSTRING(`remediation`.id, 9) AS UNSIGNED) END'), 'DESC'], // USR show up by latest id (USR2, USR1)
          [sequelize.literal('CASE WHEN `remediation`.id LIKE "SYS%" THEN CAST(SUBSTRING(`remediation`.id, 9) AS UNSIGNED) END'), 'ASC'] // SYS show up by oldest id (SYS_REM_1, SYS_REM_2)
        );
      }
      if (opt.detailed) {
        include.push({
          model: getModel('remediationExample'),
          as: 'examples',
          attributes: ['id', 'name', 'description', 'code']
        });
        include.push({
          model: getModel('systemCategory'),
          as: 'category',
          attributes: ['id', 'name', 'priority']
        });
        include.push({
          model: getModel('testCase'),
          as: 'test_cases',
          attributes: ['id', 'name', 'type', 'steps', 'result', 'instruction', 'is_selected'],
          through: { attributes: [] },
          where: testCaseWhere,
          required: false
        });
      }
      include.push({
        model: getModel('systemStandardCriteria'),
        as: 'criteria',
        attributes: ['id', 'name', 'description', 'level', 'help_url'],
        through: { attributes: [] }
      });
      const qry = CoreLib.paginateQuery({ where, include, order }, data, opt);
      let paginatedResults;
      if (opt.count) {
        const res = await Remediation.findAndCountAll({ ...qry, distinct: true });
        paginatedResults = CoreLib.paginateResult(res.rows, data);
        paginatedResults.meta.count = res.count;
      } else {
        const res = await Remediation.findAll(qry);
        paginatedResults = CoreLib.paginateResult(res, data);
      }
      paginatedResults.result = paginatedResults.result.map(item => ({
        ...item,
        selectors: item.selectors ? item.selectors.join('\n') : ''
      }));
      if (!opt.detailed) return paginatedResults;
      const totalCount = await Remediation.count();
      if (paginatedResults.meta) {
        paginatedResults.meta.total_count = totalCount;
      }
      return paginatedResults;
    } catch (e) {
      console.log('Error finding remediations: ', e);
    }
  }

  /**
   * Reads a single remediation by id.
   * @param {Object} input
   * @param {string} input.id - id of the remediation to read
   * @param {{}} [opt]
   * @return {Promise<Object>} - The remediation object with examples and test cases
   * @throws Will throw an error if the remediation is not found
   */
  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Remediation = getModel('remediation');
      const remediation = await Remediation.findByPk(data.id, {
        include: [
          {
            model: getModel('remediationExample'),
            as: 'examples',
            attributes: ['id', 'name', 'description', 'code']
          },
          {
            model: getModel('testCase'),
            as: 'test_cases',
            attributes: ['id', 'name', 'type', 'steps', 'result', 'instruction', 'is_selected'],
            through: { attributes: [] }
          },
          {
            model: getModel('systemCategory'),
            as: 'category',
            attributes: ['id', 'name', 'priority']
          },
          {
            model: getModel('systemStandardCriteria'),
            as: 'criteria',
            attributes: ['id', 'name', 'description', 'level', 'help_url'],
            through: { attributes: [] }
          }
        ]
      });
      remediation.selectors = remediation.selectors ? remediation.selectors.join('\n') : [];
      return remediation.toJSON();
    } catch (e) {
      console.log('Error reading remediation: ', e);
    }
  }

  /**
   * Updates a single remediation by id.
   * @param {Object} input
   * @param {string} input.id - id of the remediation to update
   * @param {string} [input.name] - New name of the remediation
   * @param {string} [input.description] - New description of the remediation
   * @param {string} [input.selectors] - New selectors of the remediation
   * @param {string} [input.category_id] - New system category id of the remediation
   * @param {string[]} [input.system_criteria] - New system criteria of the remediation
   * @param {string[]} [input.test_cases] - New test cases of the remediation
   * @param {Object[]} [input.examples] - New examples of the remediation
   * @param {string} [input.examples.id] - id of the example
   * @param {string} [input.examples.name] - name of the example
   * @param {string} [input.examples.description] - description of the example
   * @param {string} [input.examples.code] - code of the example
   * @param {{}} [opt]
   * @return {Promise<Object>} - The updated remediation object
   * @throws Will throw an error if the remediation is not found
   */
  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().optional(),
        description: Joi.string().optional().allow(null, ''),
        selectors: Joi.string().optional().allow(null, ''),
        is_selected: Joi.boolean().optional(),
        system_category_id: Joi.string().optional(),
        system_criteria: Joi.array().items(Joi.string()).optional(),
        test_cases: Joi.array().items(Joi.string()).optional(),
        examples: Joi.array()
          .items(
            Joi.object({
              id: Joi.string().optional().allow(''),
              name: Joi.string().required(),
              description: Joi.string().optional().allow(''),
              code: Joi.string().optional().allow('')
            })
          )
          .optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const Remediation = getModel('remediation');
      const remediation = await Remediation.findByPk(data.id);
      if (!remediation) throw new Error('Remediation not found');
      if (data.name) {
        remediation.name = data.name;
      }
      if (data.description !== undefined) {
        remediation.description = data.description;
      }
      if (data.selectors !== undefined) {
        remediation.selectors = data.selectors.split('\n').map(selector => selector.trim()).filter(Boolean);
      }
      if (data.system_category_id !== undefined) {
        remediation.system_category_id = data.system_category_id;
      }
      if (data.is_selected !== undefined) {
        remediation.is_selected = data.is_selected;
      }
      if (data.system_criteria && data.system_criteria.length > 0) {
        await remediation.setCriteria(data.system_criteria, { transaction });
      }
      if (data.test_cases && data.test_cases.length > 0) {
        await remediation.setTest_cases(data.test_cases, { transaction });
      }
      if (data.examples && data.examples.length > 0) {
        const RemediationExample = getModel('remediationExample');
        const currentExamples = await remediation.getExamples({ transaction });
        const incomingIds = data.examples
          .filter(e => e.id)
          .map(e => e.id);

        // Delete examples that are not in the incoming data.
        for (const example of currentExamples) {
          if (!incomingIds.includes(example.id)) {
            await example.destroy({ transaction });
          }
        }

        for (const exampleData of data.examples) {
          // Update existing examples and create new ones.
          if (exampleData.id) {
            await RemediationExample.update(
              {
                name: exampleData.name,
                description: exampleData.description,
                code: exampleData.code
              },
              {
                where: { id: exampleData.id },
                transaction
              }
            );
          } else {
            // Create new example and associate it with the remediation.
            await remediation.createExample(
              {
                name: exampleData.name,
                description: exampleData.description,
                code: exampleData.code
              },
              { transaction }
            );
          }
        }
      }
      await remediation.save({ transaction });
      await transaction.commit();
      return this.read({ id: remediation.id });
    } catch (e) {
      await transaction.rollback();
      console.log('Error updating remediation: ', e);
    }
  }

  /**
     * Update multiple remediations as selected or unselected.
     * @param {Object} input
     * @param {string[]} input.ids
     * @param {boolean} input.is_selected
     * @param {{}} [opt]
     * @return {Promise<void>}
     * @throws Will throw an error if there is an issue updating the remediations
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
      const Remediation = getModel('remediation');
      await Remediation.update({ is_selected: data.is_selected }, { where: { id: data.ids } });
    } catch (e) {
      console.log('Error updating remediations: ', e);
    }
  }

  /**
   * Deletes a remediation by id.
   * @param {Object} input - The input object containing the id.
   * @param {string} input.id - The id of the remediation to delete.
   * @param {{}} [opt] - Optional parameters.
   * @returns {Promise<void>}
   * @throws Will throw an error if the remediation is not found.
   */

  static async delete(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Remediation = getModel('remediation');
      const remediation = await Remediation.findByPk(data.id);
      if (!remediation) throw new Error('Remediation not found');
      await remediation.destroy();
    } catch (e) {
      console.log('Error deleting remediation: ', e);
    }
  }
}

export default RemediationLib;
