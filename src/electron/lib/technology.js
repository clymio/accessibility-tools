import Joi from 'joi';
import { Op } from 'sequelize';
import CoreLib from './core';
import { getModel } from './db';
import joiLib from './joi';

class TechnologyLib {
  static async create(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        name: Joi.string().required(),
        is_system: Joi.boolean().optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Technology = getModel('technology');
      const technology = await Technology.create({ name: data.name, is_system: data.is_system });
      return technology.toJSON();
    } catch (e) {
      console.log('Error creating technology: ', e);
    }
  }

  static async find(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().optional(),
        search: Joi.metaSearch(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const where = {};
      const Technology = getModel('technology');
      if (data.id) {
        return await this.read({ id: data.id });
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      const qry = CoreLib.paginateQuery({ where }, data, opt);
      const res = await Technology.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding technologies: ', e);
    }
  }

  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Technology = getModel('technology');
      const technology = await Technology.findByPk(data.id);
      return technology.toJSON();
    } catch (e) {
      console.log('Error reading technology: ', e);
    }
  }

  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required(),
        name: Joi.string().optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Technology = getModel('technology');
      const technology = await Technology.findByPk(data.id);
      if (!technology) throw new Error('Technology not found');
      if (data.name) {
        technology.name = data.name;
      }
      await technology.save();
      return technology.toJSON();
    } catch (e) {
      console.log('Error updating technology: ', e);
    }
  }

  static async delete(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Technology = getModel('technology');
      const technology = await Technology.findByPk(data.id);
      if (!technology) throw new Error('Technology not found');
      await technology.destroy();
    } catch (e) {
      console.log('Error deleting technology: ', e);
    }
  }
}

export default TechnologyLib;
