import Joi from 'joi';
import { Op } from 'sequelize';
import CoreLib from './core';
import { getModel } from './db';
import joiLib from './joi';

class SystemCountryLib {
  /**
   * Finds system countries.
   * @param {Object} input
   * @param {string} [input.id] - The id of the country to find
   * @param {string} [input.search] - The search string to filter countries by name
   * @param {string} [input.continent] - The id of the continent to filter countries by continent
   * @param {string[]} [input.states] - The ids of the states to filter countries by states
   * @param {number} [input.page] - The page number for pagination
   * @param {number} [input.limit] - The number of results to retrieve per page
   * @param {Object} [opt]
   * @param {boolean} [opt.detailed] - Whether to include detailed information
   * @returns an array of system countries
   */
  static async find(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().optional(),
        search: Joi.metaSearch(),
        continent: Joi.string().optional(),
        states: Joi.array().items(Joi.string()).optional(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const where = {},
        include = [];
      const SystemCountry = getModel('systemCountry'),
        SystemState = getModel('systemState');
      if (data.id) {
        return await this.read({ id: data.id });
      }
      if (data.search) {
        where[Op.or] = [{ id: { $like: `%${data.search}%` } }, { name: { $like: `%${data.search}%` } }];
      }
      if (data.continent) {
        where.continent_id = data.continent;
      }
      if (data.states) {
        const states = await SystemState.findAll({
          where: {
            id: data.states
          }
        });
        const countryIds = states.map(state => state.country_id);
        where.id = countryIds;
      }

      if (opt.detailed) {
        include.push({
          model: getModel('systemContinent'),
          as: 'continent',
          attributes: ['id', 'name']
        });
        include.push({
          model: SystemState,
          as: 'states',
          attributes: ['id', 'name']
        });
      }

      const qry = CoreLib.paginateQuery({ where, include }, data, opt);
      const res = await SystemCountry.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding systemCountries: ', e);
    }
  }

  /**
   * Finds a system country.
   * @param {Object} input
   * @param {string} input.id - The id of the country to find
   * @param {{}} [opt]
   * @returns a system country
   */
  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const SystemCountry = getModel('systemCountry');
      const res = await SystemCountry.findByPk(data.id, {
        include: [
          {
            model: getModel('systemContinent'),
            as: 'continent',
            attributes: ['id', 'name']
          },
          {
            model: getModel('systemState'),
            as: 'states',
            attributes: ['id', 'name']
          }
        ]
      });
      return res;
    } catch (e) {
      console.log('Error finding systemCountry: ', e);
    }
  }
}

export default SystemCountryLib;
