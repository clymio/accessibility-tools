import dns from 'dns/promises';
import https from 'https';
import Joi from 'joi';
import { Op } from 'sequelize';
import CoreLib from './core';
import { getModel } from './db';
import EnvironmentPageLib from './environmentPage';
import joiLib from './joi';
import ProjectLib from './project';
import Screenshot from './screenshot';
import Spider from './spider';
import { formatDomain } from './utils';

class EnvironmentLib {
  /**
   * Finds environments
   * @param {Object} input
   * @param {string} [input.id] - The id of the environment to find.
   * @param {string} [input.search] - The search string to filter environments by name.
   * @param {string} [input.project_id] - The project id that the environments belong to.
   * @param {number} [input.page] - The page number for pagination.
   * @param {number} [input.limit] - The number of items to retrieve per page.
   * @param {{}} [opt]
   * @param {boolean} [opt.detailed] - Whether to return detailed results or not.
   * @param {boolean} [opt.count] - Whether to return the total count of environments or not.
   * @returns - an array of environments.
   */
  static async find(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().optional(),
        search: Joi.metaSearch(),
        project_id: Joi.id().optional(),
        page: Joi.metaPage(),
        limit: Joi.metaLimit(true)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const where = {};
      const Environment = getModel('environment');
      if (data.id) {
        return await this.read({ id: data.id });
      }
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      if (data.project_id) {
        where.project_id = data.project_id;
      }
      const qry = CoreLib.paginateQuery({ where }, data, opt);
      let paginatedResults;
      if (opt.count) {
        const res = await Environment.findAndCountAll({ ...qry, distinct: true });
        paginatedResults = CoreLib.paginateResult(res.rows, data);
        paginatedResults.meta.count = res.count;
      } else {
        const res = await Environment.findAll(qry);
        paginatedResults = CoreLib.paginateResult(res, data);
      }
      if (!opt.detailed) return paginatedResults;
      const totalCount = await Environment.count();
      if (paginatedResults.meta) {
        paginatedResults.meta.total_count = totalCount;
      }
      return paginatedResults;
    } catch (e) {
      console.log('Error finding environments: ', e);
    }
  }

  /**
   * Reads a single environment.
   * @param {Object} input
   * @param {string} input.id - The id of the environment to read.
   * @param {{}} [opt]
   * @returns - the environment object.
   */
  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Environment = getModel('environment');
      const environment = await Environment.findByPk(data.id, {
        include: [
          {
            model: getModel('project'),
            as: 'project',
            attributes: ['id', 'name', 'image', 'connected', 'created_at', 'updated_at'],
            required: false
          },
          {
            model: getModel('environmentTest'),
            as: 'tests',
            attributes: ['id', 'name', 'functionality_note', 'page_variety_note', 'status', 'start_date', 'end_date'],
            required: false
          }
        ]
      });
      return environment.toJSON();
    } catch (e) {
      console.log('Error reading environment: ', e);
    }
  }

  /**
   * Creates a new environment.
   * @param {Object} input
   * @param {string} input.name - The name of the environment.
   * @param {string} input.url - The base URL of the environment.
   * @param {Object[]} input.sitemap - The sitemap of the environment.
   * @param {string} [input.project_id] - The project id that the environment belongs to.
   * @param {{}} [opt]
   * @returns - the newly created environment object.
   */
  static async create(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        name: Joi.string().required(),
        url: Joi.string().required(),
        sitemap: Joi.array().items(Joi.object()),
        project_id: Joi.id().optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Environment = getModel('environment');
      const environment = await Environment.create(data);
      await this.generateSitemap({ id: environment.id });
      return environment.toJSON();
    } catch (e) {
      console.log('Error creating environment: ', e);
    }
  }

  /**
   * Updates an existing environment.
   * @param {Object} input
   * @param {number} input.id - The ID of the environment to update.
   * @param {string} [input.name] - The new name for the environment.
   * @param {string} [input.url] - The new base URL for the environment.
   * @param {Array<Object>} [input.sitemap] - The new sitemap for the environment.
   * @param {{}} [opt]
   * @returns - The updated environment object
   * @throws Will throw an error if the environment is not found.
   */
  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required(),
        name: Joi.string().optional(),
        url: Joi.string().optional(),
        sitemap: Joi.array().items(Joi.object()).optional()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Environment = getModel('environment');
      const environment = await Environment.findByPk(data.id);
      if (!environment) throw new Error('Environment not found');
      let isUrlDifferent = false;
      if (data.name) {
        environment.name = data.name;
      }
      if (data.url) {
        if (environment.url !== data.url) {
          isUrlDifferent = true;
        }
        environment.url = data.url;
      }
      if (data.sitemap) {
        environment.sitemap = data.sitemap;
      }
      await environment.save();
      if (isUrlDifferent) {
        await this.deleteSitemap({ id: environment.id });
        await this.generateSitemap({ id: environment.id });
      }
      return environment.toJSON();
    } catch (e) {
      console.log('Error updating environment: ', e);
    }
  }

  /**
   * Deletes an existing environment.
   * @param {Object} input
   * @param {string} input.id - The ID of the environment to delete.
   * @param {{}} [opt]
   * @return {Promise<void>}
   * @throws Will throw an error if the environment is not found.
   */
  static async delete(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Environment = getModel('environment');
      const environment = await Environment.findByPk(data.id);
      if (!environment) throw new Error('Environment not found');
      await environment.destroy();
    } catch (e) {
      console.log('Error deleting environment: ', e);
    }
  }

  /**
   * Generates a sitemap for an environment.
   * @param {Object} input
   * @param {string} input.id - The ID of the environment to generate the sitemap for.
   * @param {{}} [opt]
   * @returns - the generated sitemap as an array of URLs.
   * @throws Will throw an error if the environment is not found.
   */
  static async generateSitemap(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const environment = await EnvironmentLib.read({ id: data.id });
      if (!environment) throw new Error('Environment not found');
      const promises = [];
      const spider = new Spider(environment.url);
      promises.push(spider.start());
      const project = environment.project;
      if (project && !project.image) {
        const screenshot = new Screenshot(environment.url);
        promises.push(screenshot.start());
      }
      const [sitemapRes, screenshotRes] = await Promise.allSettled(promises);
      if (screenshotRes && screenshotRes.status === 'fulfilled') {
        await ProjectLib.update({ id: project.id, image: screenshotRes.value });
      }
      if (sitemapRes && sitemapRes.status === 'fulfilled') {
        await EnvironmentPageLib.updateSitemap({ environment_id: environment.id, sitemap: sitemapRes.value });
      }
      return sitemapRes.value;
    } catch (e) {
      console.log('Error generating sitemap: ', e);
    }
  }

  /**
   * Deletes the sitemap for an environment.
   * @param {Object} input
   * @param {string} input.id - The ID of the environment to delete the sitemap for.
   * @param {{}} [opt]
   * @returns - an object containing a success key set to true if successful.
   * @throws Will throw an error if the environment is not found.
   */
  static async deleteSitemap(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentPage = getModel('environmentPage');
      const environment = await EnvironmentLib.read({ id: data.id });
      if (!environment) throw new Error('Environment not found');
      await EnvironmentPage.destroy({ where: { environment_id: environment.id } });
      return { success: true };
    } catch (e) {
      console.log('Error deleting environment page sitemap: ', e);
    }
  }

  /**
   * Performs a DNS lookup on the provided URL.
   * DNS lookup only works on the domain, not a full url.
   * @param {Object} input
   * @param {string} input.url - The URL to perform the DNS lookup on.
   * @param {{}} [opt]
   * @returns - an object containing a success key set to true if successful, or false if failed and an error message.
   */
  static async dnsLookup(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        url: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const url = formatDomain(data.url, true);
      const result = await dns.lookup(url);
      if (!result) {
        throw new Error('DNS lookup failed');
      }
      return { success: true };
    } catch (e) {
      console.log(`DNS lookup failed for ${data.url}`);
      return { success: false, error: e.message };
    }
  }

  /**
   * Performs a url checkup on the provided URL.
   * @param {Object} input
   * @param {string} input.url - The URL to perform checkup on.
   * @param {{}} [opt]
   * @returns - an object containing a success key set to true if successful, or false if failed and an error message.
   */
  static async urlExists(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        url: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      return new Promise((resolve, reject) => {
        const url = new URL(formatDomain(data.url));

        const options = {
          method: 'HEAD',
          hostname: url.hostname,
          path: url.pathname + url.search,
          port: url.port || 443
        };

        const req = https.request(options, (res) => {
          resolve({ success: res.statusCode < 400 });
        });
        req.on('error', reject);
        req.end();
      });
    } catch (e) {
      console.log(`URL check failed for ${data.url}`);
      return { success: false, error: e.message };
    }
  }

  /**
   * Retrieves the sitemap for a specific environment.
   * @param {Object} input
   * @param {string} input.environment_id - The ID of the environment to retrieve the sitemap for.
   * @param {{}} [opt]
   * @returns - the generated sitemap as an array.
   * @throws Will throw an error if the environment is not found.
   */
  static async getSitemap(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        environment_id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const EnvironmentPage = getModel('environmentPage');
      const environment = await EnvironmentLib.read({ id: data.environment_id });
      if (!environment) throw new Error('Environment not found');
      const pages = await EnvironmentPage.findAll({ where: { environment_id: environment.id }, attributes: ['id', 'path', 'name', 'parent_id', 'not_clickable'], raw: true });
      const sitemap = generateSitemapFromPages(pages);
      return sitemap;
    } catch (e) {
      console.log('Error getting environment page sitemap: ', e);
    }
  }

  /**
   * Creates a new page within an environment.
   * @param {Object} input
   * @param {string} input.id - The ID of the environment to which the page belongs.
   * @param {string} input.url - The URL of the page to be created.
   * @param {{}} [opt]
   * @returns - the page object.
   * @throws Will throw an error if the environment is not found.
   * @throws Will throw an error if the URL is not in the same domain as the environment URL.
   * @throws Will throw an error if the page already exists.
   * @throws Will throw an error if the DNS lookup fails.
   */
  static async createPage(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required(),
        url: Joi.string().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Environment = getModel('environment'),
        EnvironmentPage = getModel('environmentPage');
      const environment = await Environment.findByPk(data.id);
      if (!environment) {
        throw new Error('Environment not found');
      }
      const envDomain = environment.url.replace(/^(https?:\/\/)/, '').replace(/^www\./, '');
      const newDomain = data.url.replace(/^(https?:\/\/)/, '').replace(/^www\./, '');
      if (!newDomain.includes(envDomain)) {
        throw new Error('URL must be in the same domain as the environment URL');
      }
      const urlObj = new URL(data.url);
      const pathname = urlObj.pathname.split('/').filter(Boolean).join('/');
      const envPageObj = await EnvironmentPage.findOne({
        where: {
          path: pathname
        }
      });
      if (envPageObj) {
        throw new Error('Page already exists');
      }
      const { success } = await this.urlExists({ url: data.url });
      if (!success) {
        throw new Error('DNS lookup failed');
      }
      const pageId = await EnvironmentPageLib.updateSitemap({
        environment_id: environment.id,
        sitemap: [data.url]
      });
      const envPage = await EnvironmentPage.findByPk(pageId);
      if (!envPage) {
        throw new Error('Something went wrong.');
      }
      return envPage.toJSON();
    } catch (e) {
      console.log('Error creating environment page: ', e);
      throw new Error(e.message || 'An unknown error occurred while creating the environment page.');
    }
  }
}

/**
 * generates a sitemap like structure array
 * @param {{id: String, name: String, path: String, notClickable: Boolean, parent_id: String}[]} pages pages to parse sitemap from
 * @returns {Array} the sitemap array
 */
function generateSitemapFromPages(pages) {
  // Function to sort the sitemap structure alphabetically
  const sortSitemap = (sitemap) => {
    sitemap.sort((a, b) => {
      if (a.name === 'Home') return -1; // Keep "Home" on top
      if (b.name === 'Home') return 1; // Keep "Home" on top
      return a.name.localeCompare(b.name); // Alphabetical sort
    });
    sitemap.forEach((item) => {
      if (item.children) {
        sortSitemap(item.children); // Recursively sort children
      }
    });
    return sitemap;
  };

  const buildTree = (parentId = null) => {
    return pages
      .filter(page => page.parent_id === parentId)
      .map((page) => {
        const children = buildTree(page.id); // Recursively find children
        return children.length > 0 ? { ...page, children } : { ...page };
      });
  };

  const tree = buildTree();
  const sitemap = sortSitemap(tree);
  return sitemap;
}

export default EnvironmentLib;
