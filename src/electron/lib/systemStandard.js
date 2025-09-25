import Joi from 'joi';
import { Op } from 'sequelize';
import CoreLib from './core';
import { getModel } from './db';
import joiLib from './joi';

class SystemStandardLib {
  /**
   * Finds system standards.
   * @param {Object} input
   * @param {string} [input.id] - The id of the system standard to find.
   * @param {string} [input.search] - The search string to search for.
   * @param {number} [input.page] - The page to retrieve.
   * @param {number} [input.limit] - The number of results to retrieve per page.
   * @param {{}} [opt]
   * @returns {Promise<Object[]>} Resolves with an array of system standards.
   */
  static async find(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        search: Joi.metaSearch(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemStandard = getModel('systemStandard');
      const where = {},
        include = [];
      if (data.id) {
        where.id = data.id;
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      if (opt.detailed) {
        include.push({
          model: getModel('systemStandardVersion'),
          as: 'versions',
          attributes: ['id', 'name']
        });
        include.push({
          model: getModel('systemStandardPrinciple'),
          as: 'principles',
          attributes: ['id', 'name', 'description'],
          include: [
            {
              model: getModel('systemStandardGuideline'),
              as: 'guidelines',
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: getModel('systemStandardCriteria'),
                  as: 'criteria',
                  attributes: ['id', 'name', 'description', 'level']
                }
              ]
            }
          ]
        });
      }
      const qry = CoreLib.paginateQuery({ where, include }, data, opt);
      const res = await SystemStandard.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding standards: ', e);
    }
  }

  /**
   * Finds system standard versions.
   * @param {Object} input
   * @param {string} [input.id] - The id of the system standard version to find.
   * @param {string} [input.system_standard_id] - The id of the associated system standard.
   * @param {string} [input.search] - The search string to search for.
   * @param {number} [input.page] - The page to retrieve.
   * @param {number} [input.limit] - The number of results to retrieve per page.
   * @param {{}} [opt]
   * @returns {Promise<Object[]>} Resolves with an array of system standard versions.
   */
  static async findVersions(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        system_standard_id: Joi.string().optional(),
        search: Joi.metaSearch(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemStandardVersion = getModel('systemStandardVersion');
      const where = {};
      if (data.id) {
        where.id = data.id;
      }
      if (data.system_standard_id) {
        where.system_standard_id = data.system_standard_id;
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      const qry = CoreLib.paginateQuery({ where }, data, opt);
      const res = await SystemStandardVersion.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding standard versions: ', e);
    }
  }

  /**
   * Finds system standard principles.
   * @param {Object} input
   * @param {string} [input.id] - The id of the system standard principle to find.
   * @param {string} [input.system_standard_id] - The id of the associated system standard.
   * @param {string} [input.system_standard_version_id] - The id of the associated system standard version.
   * @param {string} [input.search] - The search string to search for.
   * @param {number} [input.page] - The page to retrieve.
   * @param {number} [input.limit] - The number of results to retrieve per page.
   * @param {{}} [opt]
   * @returns {Promise<Object[]>} Resolves with an array of system standard principles.
   */
  static async findPrinciples(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        system_standard_id: Joi.string().optional(),
        system_standard_version_id: Joi.string().optional(),
        search: Joi.metaSearch(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemStandardPrinciple = getModel('systemStandardPrinciple');
      const where = {},
        include = [];
      if (data.id) {
        where.id = data.id;
      }
      if (data.system_standard_id) {
        where.system_standard_id = data.system_standard_id;
      }
      if (data.system_standard_version_id) {
        include.push({
          model: getModel('systemStandardVersion'),
          as: 'versions',
          required: true,
          where: {
            id: data.system_standard_version_id
          },
          through: { attributes: [] },
          attributes: []
        });
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      const qry = CoreLib.paginateQuery({ where, include }, data, opt);
      const res = await SystemStandardPrinciple.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding standard principles: ', e);
    }
  }

  /**
   * Finds system standard guidelines.
   * @param {Object} input
   * @param {string} [input.id] - Specific standard guideline ID to find
   * @param {string} [input.system_standard_id] - System standard ID to filter by
   * @param {string} [input.system_standard_version_id] - System standard version ID to filter by
   * @param {string} [input.system_standard_principle_id] - System standard principle ID to filter by
   * @param {string} [input.search] - Search term for matching standard guideline names
   * @param {number} [input.page] - Page number for pagination
   * @param {number} [input.limit] - Number of results per page
   * @param {{}} [opt]
   * @return {Promise<Object[]>} - Paginated list of system standard guidelines matching the criteria
   */
  static async findGuidelines(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        system_standard_id: Joi.string().optional(),
        system_standard_version_id: Joi.string().optional(),
        system_standard_principle_id: Joi.string().optional(),
        search: Joi.metaSearch(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemStandardGuideline = getModel('systemStandardGuideline');
      const where = {},
        include = [];
      if (data.id) {
        where.id = data.id;
      }
      if (data.system_standard_id) {
        where.system_standard_id = data.system_standard_id;
      }
      if (data.system_standard_version_id) {
        include.push({
          model: getModel('systemStandardVersion'),
          as: 'versions',
          required: true,
          where: {
            id: data.system_standard_version_id
          },
          through: { attributes: [] },
          attributes: []
        });
      }
      if (data.system_standard_principle_id) {
        where.system_standard_principle_id = data.system_standard_principle_id;
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      const qry = CoreLib.paginateQuery({ where, include }, data, opt);
      const res = await SystemStandardGuideline.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding standard guidelines: ', e);
    }
  }

  /**
   * Finds system standard criteria.
   * @param {Object} input
   * @param {string} [input.id] - The id of the system standard criteria to find.
   * @param {string} [input.system_standard_id] - The id of the associated system standard.
   * @param {string} [input.system_standard_version_id] - The id of the associated system standard version.
   * @param {string} [input.system_standard_principle_id] - The id of the associated system standard principle.
   * @param {string} [input.system_standard_guideline_id] - The id of the associated system standard guideline.
   * @param {string} [input.search] - The search string to search for.
   * @param {number} [input.page] - The page to retrieve.
   * @param {number} [input.limit] - The number of results to retrieve per page.
   * @param {{}} [opt]
   * @returns {Promise<Object[]>} Resolves with an array of system standard criteria.
   */
  static async findCriteria(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        system_standard_id: Joi.string().optional(),
        system_standard_version_id: Joi.string().optional(),
        system_standard_principle_id: Joi.string().optional(),
        system_standard_guideline_id: Joi.string().optional(),
        search: Joi.metaSearch(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemStandardCriteria = getModel('systemStandardCriteria');
      const where = {},
        include = [];
      if (data.id) {
        where.id = data.id;
      }
      if (data.system_standard_id) {
        where.system_standard_id = data.system_standard_id;
      }
      if (data.system_standard_version_id) {
        include.push({
          model: getModel('systemStandardVersion'),
          as: 'versions',
          required: true,
          where: {
            id: data.system_standard_version_id
          },
          through: { attributes: [] },
          attributes: []
        });
      }
      if (data.system_standard_principle_id) {
        where.system_standard_principle_id = data.system_standard_principle_id;
      }
      if (data.system_standard_guideline_id) {
        where.system_standard_guideline_id = data.system_standard_guideline_id;
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      const qry = CoreLib.paginateQuery({ where, include }, data, opt);
      const res = await SystemStandardCriteria.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding standard criteria: ', e);
    }
  }
}

export default SystemStandardLib;
