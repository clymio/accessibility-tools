import Joi from 'joi';
import { Op } from 'sequelize';
import CoreLib from './core';
import { getModel } from './db';
import joiLib from './joi';
import { convertToId } from './utils';

class SystemCategoryLib {
  /**
   * Creates a new system category.
   * @param {Object} input
   * @param {string} input.name - The name of the category.
   * @param {boolean} [input.is_system] - Whether the category is a system category.
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
      const SystemCategory = getModel('systemCategory');
      const systemCategory = await SystemCategory.create({
        id: convertToId(data.name),
        name: data.name,
        is_system: data.is_system
      });
      return systemCategory.toJSON();
    } catch (e) {
      console.log('Error creating system category: ', e);
    }
  }

  /**
   * Finds system categories based on the given input criteria.
   * @param {Object} input
   * @param {string} [input.id] - The id of the category to find.
   * @param {string} [input.search] - The search string to filter categories by name.
   * @param {boolean} [input.is_system] - Whether to filter categories by system status.
   * @param {boolean} [input.is_selected] - Whether to filter categories by selected status.
   * @param {number} [input.page] - The page number for pagination.
   * @param {number} [input.limit] - The number of results to retrieve per page.
   * @param {{}} [opt]
   * @param {boolean} [opt.detailed] - whether to return detailed results or not
   * @returns {Promise<Object[]>} Resolves with an array of system categories.
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
      const where = {},
        include = [];
      const Category = getModel('systemCategory');
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
      const qry = CoreLib.paginateQuery(
        {
          where,
          include,
          order: [
            ['priority', 'DESC'],
            ['name', 'ASC']
          ]
        },
        data,
        opt
      );
      let paginatedResults;
      if (opt.count) {
        const res = await Category.findAndCountAll({ ...qry, distinct: true });
        paginatedResults = CoreLib.paginateResult(res.rows, data);
        paginatedResults.meta.count = res.count;
      } else {
        const res = await Category.findAll(qry);
        paginatedResults = CoreLib.paginateResult(res, data);
      }
      if (!opt.detailed) return paginatedResults;
      const totalCount = await Category.count();
      if (paginatedResults.meta) {
        paginatedResults.meta.total_count = totalCount;
      }
      return paginatedResults;
    } catch (e) {
      console.log('Error finding categories: ', e);
    }
  }

  /**
   * Reads a system category.
   * @param {Object} input
   * @param {string} input.id - The id of the category to read.
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
      const Category = getModel('systemCategory');
      const res = await Category.findByPk(data.id);
      return res.toJSON();
    } catch (e) {
      console.log('Error finding category: ', e);
    }
  }

  /**
   * Updates a system category.
   * @param {Object} input
   * @param {string} input.id - The id of the category to update.
   * @param {string} [input.name] - The new name for the category.
   * @param {boolean} [input.is_selected] - The new selected status for the category.
   * @param {{}} [opt]
   * @returns {Promise<Object>}
   * @throws Will throw an error if the category is not found or if it's a system category.
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
      const Category = getModel('systemCategory');
      const category = await Category.findByPk(data.id);
      if (!category) {
        throw new Error('category not found');
      }
      if (data.name) {
        category.name = data.name;
      }
      if (data.is_selected !== undefined) {
        category.is_selected = data.is_selected;
      }
      await category.save();
      return this.find({ id: data.id });
    } catch (e) {
      console.log('Error updating category: ', e);
    }
  }

  /**
   * Updates the priority of the given system categories.
   * @param {Object} input
   * @param {string[]} input.ids - The ids of the categories to update.
   * @param {{}} [opt]
   * @returns {Promise<void>}
   */
  static async updatePriority(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        ids: Joi.array().items(Joi.string()).required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Category = getModel('systemCategory');
      const categories = await Category.findAll();
      const newPriorities = [];
      for (let i = 0; i < data.ids.length; i++) {
        const category = categories.find(c => c.id === data.ids[i]).toJSON();
        const newPriority = categories.length - 1 - i;
        if (category.priority !== newPriority) {
          newPriorities.push({
            id: category.id,
            name: category.name,
            priority: newPriority
          });
        }
      }
      await Category.bulkCreate(newPriorities, { updateOnDuplicate: ['priority'] });
    } catch (e) {
      console.log('Error updating category priorities: ', e);
    }
  }

  /**
   * Updates multiple system categories as selected or unselected.
   * @param {Object} input
   * @param {string[]} input.ids - The ids of the categories to update.
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
      const Category = getModel('systemCategory');
      await Category.update({ is_selected: data.is_selected }, { where: { id: data.ids } });
    } catch (e) {
      console.log('Error updating system categories: ', e);
    }
  }

  /**
   * Deletes a system category.
   * @param {Object} input
   * @param {string} input.id - The id of the category to delete.
   * @param {{}} [opt]
   * @throws Will throw an error if the category is not found or if it's a system category.
   */
  static async delete(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Category = getModel('systemCategory');
      const category = await Category.findByPk(data.id);
      if (!category) {
        throw new Error('category not found');
      }
      if (category.is_system) {
        throw new Error('cannot delete system category');
      }
      await category.destroy();
    } catch (e) {
      console.log('Error deleting category: ', e);
    }
  }
}

export default SystemCategoryLib;
