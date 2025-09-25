import Joi from 'joi';
import { Op } from 'sequelize';
import CoreLib from './core';
import sequelize, { getModel } from './db';
import joiLib from './joi';

class ProfileLib {
  /**
   * Creates a new profile
   * @param {Object} input
   * @param {string} input.first_name - the first name
   * @param {string} input.last_name - the last name
   * @param {string} input.title - the title
   * @param {string} [input.image] - the image URL
   * @param {Object} [input.organization] - the organization data
   * @param {string} [input.organization.name] - the name
   * @param {string} [input.organization.email] - the email
   * @param {string} [input.organization.phone] - the phone
   * @param {string} [input.organization.address] - the address
   * @param {string} [input.organization.address_2] - the address 2
   * @param {string} [input.organization.city] - the city
   * @param {string} [input.organization.zip_code] - the zip code
   * @param {string} [input.organization.state] - the state ID
   * @param {string} [input.organization.country] - the country ID
   * @param {string} [input.organization.url] - the URL
   * @param {{}} [opt]
   * @returns the created profile
   */
  static async create(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        title: Joi.string().required(),
        image: Joi.string().optional().allow(null, ''),
        organization: Joi.object({
          logo: Joi.string().optional().allow(''),
          name: Joi.string().optional().allow(''),
          email: Joi.string().optional().allow(''),
          phone: Joi.string().optional().allow(''),
          address: Joi.string().optional().allow(''),
          address_2: Joi.string().optional().allow(''),
          city: Joi.string().optional().allow(''),
          zip_code: Joi.string().optional().allow(''),
          state: Joi.state().optional().allow(''),
          country: Joi.country().optional().allow(''),
          url: Joi.string().optional().allow('')
        }).optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const Profile = getModel('profile'),
        ProfileOrganization = getModel('profileOrganization');
      const { first_name, last_name, title, image, organization } = data;
      const profileObj = await Profile.create(
        {
          first_name,
          last_name,
          title,
          image
        },
        { transaction }
      );
      if (organization && Object.keys(organization).length > 0) {
        await ProfileOrganization.create(
          {
            ...organization,
            profile_id: profileObj.id,
            state_id: organization.state || null,
            country_id: organization.country || null
          },
          { transaction }
        );
      }
      await transaction.commit();
      return this.read({ id: profileObj.id });
    } catch (e) {
      console.log('Error creating profile: ', e);
      await transaction.rollback();
    }
  }

  /**
   * Find profiles
   * @param {Object} input
   * @param {string} [input.id] - the profile id
   * @param {string} [input.search] - the search query
   * @param {number} [input.page] - the page number
   * @param {number} [input.limit] - the number of records per page
   * @param {Object} [opt]
   * @param {boolean} [opt.detailed] - whether to include detailed information
   * @returns a paginated result of profiles
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
      const Profile = getModel('profile');
      const where = {},
        include = [];
      if (data.id) {
        return await this.read({ id: data.id });
      }
      if (data.search) {
        where[Op.or] = [{ first_name: { $like: `%${data.search}%` } }, { last_name: { $like: `%${data.search}%` } }, { title: { $like: `%${data.search}%` } }];
      }

      if (opt.detailed) {
        include.push({
          model: getModel('profileOrganization'),
          as: 'organization',
          attributes: ['id', 'logo', 'name', 'email', 'phone', 'address', 'address_2', 'city', 'zip_code', 'url'],
          include: [
            {
              model: getModel('systemCountry'),
              as: 'country',
              attributes: ['id', 'name', 'short_name', 'phone_prefix']
            },
            {
              model: getModel('systemState'),
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        });
      }

      const qry = CoreLib.paginateQuery({ where, include }, data, opt);
      const res = await Profile.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding profile: ', e);
    }
  }

  /**
   * Reads a profile based on the provided id.
   * @param {Object} input
   * @param {string} input.id - The id of the profile to read.
   * @param {{}} [opt]
   * @returns The profile
   * @throws Will log an error and throw if unable to read the profile.
   */
  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Profile = getModel('profile');
      const profile = await Profile.findByPk(data.id, {
        include: [
          {
            model: getModel('profileOrganization'),
            as: 'organization',
            attributes: ['id', 'logo', 'name', 'email', 'phone', 'address', 'address_2', 'city', 'zip_code', 'url'],
            include: [
              {
                model: getModel('systemCountry'),
                as: 'country',
                attributes: ['id', 'name', 'short_name', 'phone_prefix']
              },
              {
                model: getModel('systemState'),
                as: 'state',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });
      return profile.toJSON();
    } catch (e) {
      console.log('Error reading profile: ', e);
    }
  }

  /**
   * Updates an existing profile with new data.
   * @param {Object} input
   * @param {string} input.id - The profile ID to update.
   * @param {string} [input.first_name] - The updated first name.
   * @param {string} [input.last_name] - The updated last name.
   * @param {string} [input.title] - The updated title.
   * @param {string} [input.image] - The updated image URL.
   * @param {Object} [input.organization] - The updated organization data.
   * @param {string} [input.organization.name] - The updated organization name.
   * @param {string} [input.organization.email] - The updated organization email.
   * @param {string} [input.organization.phone] - The updated organization phone.
   * @param {string} [input.organization.address] - The updated organization address.
   * @param {string} [input.organization.address_2] - The updated secondary address.
   * @param {string} [input.organization.city] - The updated organization city.
   * @param {string} [input.organization.zip_code] - The updated organization zip code.
   * @param {string} [input.organization.state] - The updated organization state.
   * @param {string} [input.organization.country] - The updated organization country.
   * @param {string} [input.organization.url] - The updated organization URL.
   * @param {{}} [opt]
   * @returns The updated profile.
   * @throws Will log an error and throw if unable to update the profile.
   */
  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required(),
        first_name: Joi.string().optional().allow(''),
        last_name: Joi.string().optional().allow(''),
        title: Joi.string().optional().allow(''),
        image: Joi.string().optional().allow(null, ''),
        organization: Joi.object({
          logo: Joi.string().optional().allow(''),
          name: Joi.string().optional().allow(''),
          email: Joi.string().optional().allow(''),
          phone: Joi.string().optional().allow(''),
          address: Joi.string().optional().allow(''),
          address_2: Joi.string().optional().allow(''),
          city: Joi.string().optional().allow(''),
          zip_code: Joi.string().optional().allow(''),
          state: Joi.state().optional().allow(''),
          country: Joi.country().optional().allow(''),
          url: Joi.string().optional().allow('')
        }).optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const Profile = getModel('profile'),
        ProfileOrganization = getModel('profileOrganization');
      const { id, first_name, last_name, title, image, organization } = data;
      const profile = await Profile.findByPk(id, { include: [
        {
          model: ProfileOrganization,
          as: 'organization'
        }
      ], transaction });
      if (!profile) throw new Error('Profile not found');
      if (first_name !== undefined) {
        profile.first_name = first_name;
      }
      if (last_name !== undefined) {
        profile.last_name = last_name;
      }
      if (title !== undefined) {
        profile.title = title;
      }
      if (image !== undefined) {
        profile.image = image;
      }
      await profile.save({ transaction });
      if (organization && Object.keys(organization).length > 0) {
        const profileData = {
          ...organization
        };
        delete profileData.state;
        delete profileData.country;
        if (organization.state) {
          profileData.state_id = organization.state;
        }
        if (organization.country) {
          profileData.country_id = organization.country;
        }
        if (profile.organization) {
          await ProfileOrganization.update(profileData, { where: { id: profile.organization.id }, transaction });
        } else {
          await ProfileOrganization.create({ ...profileData, profile_id: id }, { transaction });
        }
      } else {
        if (profile.organization) {
          await ProfileOrganization.destroy({ where: { id: profile.organization.id }, transaction });
        }
      }
      await transaction.commit();
      return this.read({ id });
    } catch (e) {
      console.log('Error updating profile: ', e);
      await transaction.rollback();
    }
  }

  /**
   * Deletes an existing profile.
   * @param {Object} input
   * @param {string} input.id - The ID of the profile to delete.
   * @param {{}} [opt]
   * @throws Will log an error and return a failure message if unable to delete the profile.
   */
  static async delete(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Profile = getModel('profile');
      const profile = await Profile.findByPk(data.id);
      if (!profile) throw new Error('Profile not found');
      await profile.destroy();
      return { success: true, message: 'Profile deleted successfully' };
    } catch (e) {
      console.log('Error deleting profile: ', e);
      return { success: false, message: 'Error deleting profile' };
    }
  }
}

export default ProfileLib;
