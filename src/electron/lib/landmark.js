import Joi from 'joi';
import CoreLib from './core';
import { getModel } from './db';
import joiLib from './joi';

class LandmarkLib {
  /**
   * Finds system landmarks.
   * @param {Object} input
   * @param {string} [input.id] - The id of the landmark to find
   * @param {string} [input.search] - The search string to filter landmarks by name
   * @param {number} [input.page] - The page number for pagination
   * @param {number} [input.limit] - The number of results to retrieve per page
   * @param {{}} [opt]
   * @returns an array of system landmarks
   */
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
      const Landmark = getModel('systemLandmark');
      if (data.id) {
        return await this.read({ id: data.id });
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      const qry = CoreLib.paginateQuery({ where }, data, opt);
      const res = await Landmark.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding landmarks: ', e);
    }
  }

  /**
   * Finds a system landmark.
   * @param {Object} input
   * @param {string} input.id - The id of the landmark to find
   * @param {{}} [opt]
   * @returns a system landmark
   */
  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Landmark = getModel('systemLandmark');
      const res = await Landmark.findByPk(data.id);
      return res.toJSON();
    } catch (e) {
      console.log('Error finding landmark: ', e);
    }
  }
}

export default LandmarkLib;
