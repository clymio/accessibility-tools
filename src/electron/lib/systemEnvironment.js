import Joi from 'joi';
import { Op } from 'sequelize';
import CoreLib from './core';
import { getModel } from './db';
import joiLib from './joi';
import { convertToId } from './utils';
class SystemEnvironment {
  /**
   * Creates a new system environment.
   * @param {Object} input
   * @param {string} input.name - The name of the environment.
   * @param {boolean} [input.is_system] - Whether the environment is a system environment.
   * @param {{}} [opt]
   * @returns {Promise<Object>}
   */
  static async create(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        name: Joi.string().required(),
        is_system: Joi.boolean().optional().default(false)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemEnvironment = getModel('systemEnvironment');
      const systemEnvironment = await SystemEnvironment.create({
        id: convertToId(data.name),
        name: data.name,
        is_system: data.is_system
      });
      return systemEnvironment.toJSON();
    } catch (e) {
      console.log('Error creating system environment: ', e);
    }
  }

  /**
   * Finds system environments.
   * @param {Object} input
   * @param {string} [input.id] - The id of the environment to find.
   * @param {string} [input.search] - The search string to filter environments by name.
   * @param {boolean} [input.is_system] - Whether to filter environments by system status.
   * @param {boolean} [input.is_selected] - Whether to filter environments by selected status.
   * @param {number} [input.page] - The page number for pagination.
   * @param {number} [input.limit] - The number of results to retrieve per page.
   * @param {{}} [opt]
   * @returns {Promise<Object[]>} Resolves with an array of system environments.
   */
  static async find(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().optional(),
        search: Joi.metaSearch(),
        is_system: Joi.boolean().optional(),
        is_selected: Joi.boolean().optional(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const where = {};
      const SystemEnvironment = getModel('systemEnvironment');
      if (data.id) {
        return await this.read({ id: data.id });
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      if (data.is_system !== undefined) {
        where.is_system = data.is_system;
      }
      if (data.is_selected !== undefined) {
        where.is_selected = data.is_selected;
      }
      const qry = CoreLib.paginateQuery({ where }, data, opt);
      let paginatedResults;
      if (opt.count) {
        const res = await SystemEnvironment.findAndCountAll({ ...qry, distinct: true });
        paginatedResults = CoreLib.paginateResult(res.rows, data);
        paginatedResults.meta.count = res.count;
      } else {
        const res = await SystemEnvironment.findAll(qry);
        paginatedResults = CoreLib.paginateResult(res, data);
      }
      if (!opt.detailed) return paginatedResults;
      const totalCount = await SystemEnvironment.count();
      if (paginatedResults.meta) {
        paginatedResults.meta.total_count = totalCount;
      }
      return paginatedResults;
    } catch (e) {
      console.log('Error finding system environments: ', e);
    }
  }

  /**
   * Reads a system environment.
   * @param {Object} input
   * @param {string} input.id - The id of the environment to read.
   * @param {{}} [opt]
   * @returns {Promise<Object>}
   */
  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemEnvironment = getModel('systemEnvironment');
      const res = await SystemEnvironment.findByPk(data.id);
      return res.toJSON();
    } catch (e) {
      console.log('Error finding system environment: ', e);
    }
  }

  /**
   * Updates a system environment.
   * @param {Object} input
   * @param {string} input.id - The id of the environment to update.
   * @param {string} [input.name] - The new name for the environment.
   * @param {boolean} [input.is_selected] - The new selected status for the environment.
   * @param {{}} [opt]
   * @returns {Promise<Object>}
   * @throws Will throw an error if the environment is not found or if it's a system environment.
   */
  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().optional(),
        is_selected: Joi.boolean().optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemEnvironment = getModel('systemEnvironment');
      const systemEnvironment = await SystemEnvironment.findByPk(data.id);
      if (!systemEnvironment) {
        throw new Error('System environment not found');
      }
      if (data.name) {
        systemEnvironment.name = data.name;
      }
      if (data.is_selected !== undefined) {
        systemEnvironment.is_selected = data.is_selected;
      }
      await systemEnvironment.save();
      return this.read({ id: data.id });
    } catch (e) {
      console.log('Error updating system environment: ', e);
    }
  }

  /**
 * Updates multiple system environments as selected or unselected.
 * @param {Object} input
 * @param {string[]} input.ids - The ids of the environments to update.
 * @param {boolean} input.is_selected - The new selected status.
 * @param {{}} [opt]
 * @returns {Promise<void>}
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
      const SystemEnvironment = getModel('systemEnvironment');
      await SystemEnvironment.update({ is_selected: data.is_selected }, { where: { id: data.ids } });
    } catch (e) {
      console.log('Error updating system environments: ', e);
    }
  }

  /**
   * Deletes a system environment.
   * @param {Object} input
   * @param {string} input.id - The id of the environment to delete.
   * @param {{}} [opt]
   * @throws Will throw an error if the environment is not found or if it's a system environment.
   */
  static async delete(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemEnvironment = getModel('systemEnvironment');
      const systemEnvironment = await SystemEnvironment.findByPk(data.id);
      if (!systemEnvironment) {
        throw new Error('System environment not found');
      }
      if (systemEnvironment.is_system) {
        throw new Error('Cannot delete system environment');
      }
      await systemEnvironment.destroy();
    } catch (e) {
      console.log('Error deleting system environment: ', e);
    }
  }
}

export default SystemEnvironment;
