import Joi from 'joi';
import { Op } from 'sequelize';
import CoreLib from './core';
import { getModel } from './db';
import joiLib from './joi';

class ProjectLib {
  static async create(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        name: Joi.string().required(),
        image: Joi.string().optional().allow(null, ''),
        connected: Joi.boolean().optional().default(false)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Project = getModel('project');
      const project = await Project.create(data, { raw: true });
      return project.toJSON();
    } catch (e) {
      console.log('Error creating project: ', e);
    }
  }

  static async find(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().optional(),
        connected: Joi.boolean().optional(),
        search: Joi.metaSearch(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const where = {};
      const Project = getModel('project');
      if (data.id) {
        return await this.read({ id: data.id });
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      if (data.connected !== undefined && data.connected !== null) {
        where.connected = data.connected;
      }
      const qry = CoreLib.paginateQuery({ where }, data, opt);
      const res = await Project.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding projects: ', e);
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
      const Project = getModel('project');
      const project = await Project.findByPk(data.id, {
        include: [
          {
            model: getModel('environment'),
            as: 'environments'
          },
          {
            model: getModel('technology'),
            as: 'technologies',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ]
      });
      return project.toJSON();
    } catch (e) {
      console.log('Error reading project: ', e);
    }
  }

  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required(),
        name: Joi.string().optional(),
        image: Joi.string().optional(),
        connected: Joi.boolean().optional(),
        essential_functionality: Joi.string().optional().allow(''),
        webpage_types: Joi.string().optional().allow(''),
        technologies: Joi.array().items(Joi.string()).optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Project = getModel('project');
      const project = await Project.findByPk(data.id);
      if (!project) throw new Error('Project not found');
      if (data.name) {
        project.name = data.name;
      }
      if (data.image) {
        project.image = data.image;
      }
      if (data.connected !== undefined) {
        project.connected = data.connected;
      }
      if (data.essential_functionality !== undefined) {
        project.essential_functionality = data.essential_functionality;
      }
      if (data.webpage_types !== undefined) {
        project.webpage_types = data.webpage_types;
      }
      await project.save();
      if (data.technologies !== undefined) {
        await project.setTechnologies(data.technologies);
      }
      return project.toJSON();
    } catch (e) {
      console.log('Error updating project: ', e);
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
      const Project = getModel('project');
      const project = await Project.findByPk(data.id);
      if (!project) throw new Error('Project not found');
      await project.destroy();
      return { success: true, message: 'Project deleted successfully' };
    } catch (e) {
      console.log('Error deleting project: ', e);
      return { success: false, message: 'Error deleting project' };
    }
  }
}

export default ProjectLib;
