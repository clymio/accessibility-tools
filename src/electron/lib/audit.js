import { AUDIT_ITEM_LEVEL_VALUES, LEVELS } from '@/constants/audit';
import { REPORT_FORMATS, REPORT_TYPES } from '@/constants/report';
import { AUDIT_STATUS, CONFORMANCE_TARGETS } from '@/electron/db/models/audit';
import { auditChapterSections } from '@/electron/db/systemData.json';
import Joi from 'joi';
import { literal, Op } from 'sequelize';
import CoreLib from './core';
import sequelize, { getModel } from './db';
import joiLib from './joi';
import ReportLib from './report';
import { formatDate, strToCase } from './utils';

const SECTION_SORT_PRIORITY = auditChapterSections.map(s => s.key);

const WCAG_LEVELS = ['A', 'AA', 'AAA'];
const WCAG_LEVELS_MAP = {
  A: ['A'],
  AA: ['A', 'AA'],
  AAA: ['A', 'AA', 'AAA']
};

class AuditLib {
  /**
   * Create a new audit
   * @param {Object} input
   * @param {string} input.status - The status of the audit, must be one of the predefined audit statuses.
   * @param {string} input.wcag_version - The WCAG version for the audit, must be one of the predefined WCAG versions.
   * @param {string} input.conformance_target - The conformance target for the audit, must be one of the predefined targets.
   * @param {string} input.identifier - A unique identifier for the audit.
   * @param {string} input.project_id - The ID of the associated project.
   * @param {string} input.environment_id - The ID of the associated environment.
   * @param {string} input.environment_test_id - The ID of the associated environment test.
   * @param {string} input.profile_id - The ID of the associated profile.
   * @param {string} input.audit_type_id - The ID of the audit type.
   * @param {string} input.audit_type_version_id - The ID of the audit type version.
   * @param {Array<string>} input.audit_chapters - Array of audit chapter IDs.
   * @param {Date} [input.start_date] - The start date of the audit.
   * @param {string} [input.product_name] - The name of the product being audited.
   * @param {string} [input.product_version] - The version of the product being audited.
   * @param {string} [input.product_description] - A description of the product.
   * @param {string} [input.product_url] - The URL of the product.
   * @param {string} [input.vendor_name] - The name of the vendor.
   * @param {string} [input.vendor_address] - The address of the vendor.
   * @param {string} [input.vendor_url] - The URL of the vendor.
   * @param {string} [input.vendor_contact_name] - The contact name at the vendor.
   * @param {string} [input.vendor_contact_email] - The contact email at the vendor.
   * @param {string} [input.vendor_contact_phone] - The contact phone number at the vendor.
   * @param {string} [input.notes] - Any additional notes about the audit.
   * @param {string} [input.methods] - The methods used in the audit.
   * @param {string} [input.disclaimer] - Any disclaimers related to the audit.
   * @param {string} [input.repository_url] - The URL of the repository being audited.
   * @param {string} [input.feedback] - Feedback related to the audit.
   * @param {string} [input.license] - The licensing information for the audit.
   * @param {string} [input.summary] - A summary of the audit.
   * @param {{}} opt
   * @returns - the created audit object.
   */
  static async create(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        status: Joi.enum(AUDIT_STATUS).optional().allow(null, ''),
        wcag_version: Joi.string().required(),
        conformance_target: Joi.enum(CONFORMANCE_TARGETS).required(),
        identifier: Joi.string().required(),
        project_id: Joi.id().required(),
        environment_id: Joi.id().required(),
        environment_test_id: Joi.id().required(),
        profile_id: Joi.id().required(),
        audit_type_id: Joi.string().required(),
        audit_type_version_id: Joi.string().optional().allow(null, ''),
        audit_chapters: Joi.array().items(Joi.string()).required(),
        start_date: Joi.date().optional().allow(null, ''),
        product_name: Joi.string().optional().allow(null, ''),
        product_version: Joi.string().optional().allow(null, ''),
        product_description: Joi.string().optional().allow(null, ''),
        product_url: Joi.string().optional().allow(null, ''),
        vendor_name: Joi.string().optional().allow(null, ''),
        vendor_address: Joi.string().optional().allow(null, ''),
        vendor_url: Joi.string().optional().allow(null, ''),
        vendor_contact_name: Joi.string().optional().allow(null, ''),
        vendor_contact_email: Joi.string().optional().allow(null, ''),
        vendor_contact_phone: Joi.string().optional().allow(null, ''),
        notes: Joi.string().optional().allow(null, ''),
        methods: Joi.string().optional().allow(null, ''),
        disclaimer: Joi.string().optional().allow(null, ''),
        repository_url: Joi.string().optional().allow(null, ''),
        feedback: Joi.string().optional().allow(null, ''),
        license: Joi.string().optional().allow(null, ''),
        summary: Joi.string().optional().allow(null, '')
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const Audit = getModel('audit'),
        AuditItem = getModel('auditItem'),
        SystemAuditChapterSectionItem = getModel('systemAuditChapterSectionItem');
      const audit = await Audit.create(
        {
          status: data.status,
          conformance_target: data.conformance_target,
          wcag_version: data.wcag_version,
          identifier: data.identifier,
          project_id: data.project_id,
          environment_id: data.environment_id,
          environment_test_id: data.environment_test_id,
          profile_id: data.profile_id,
          system_audit_type_id: data.audit_type_id,
          system_audit_type_version_id: data.audit_type_version_id,
          start_date: data.start_date,
          product_name: data.product_name,
          product_version: data.product_version,
          product_description: data.product_description,
          product_url: data.product_url,
          vendor_name: data.vendor_name,
          vendor_address: data.vendor_address,
          vendor_url: data.vendor_url,
          vendor_contact_name: data.vendor_contact_name,
          vendor_contact_email: data.vendor_contact_email,
          vendor_contact_phone: data.vendor_contact_phone,
          notes: data.notes,
          methods: data.methods,
          disclaimer: data.disclaimer,
          repository_url: data.repository_url,
          feedback: data.feedback,
          license: data.license,
          summary: data.summary
        },
        {
          transaction
        }
      );
      await audit.setChapters(data.audit_chapters, { transaction });
      const sectionItems = await SystemAuditChapterSectionItem.findAll({
        where: {
          system_audit_chapter_section_id: data.audit_chapters
        },
        include: [
          {
            model: getModel('systemAuditChapterSectionItemType'),
            as: 'types',
            attributes: ['id']
          },
          {
            model: getModel('systemStandardCriteria'),
            as: 'criteria',
            attributes: ['id'],
            required: false,
            include: [
              {
                model: getModel('systemStandardVersion'),
                as: 'versions',
                attributes: ['id'],
                required: false,
                through: {
                  attributes: []
                }
              }
            ]
          }
        ]
      });
      const filteredItems = sectionItems
        .map((s) => {
          s = s.toJSON();
          if (s.criteria && s.criteria.versions) {
            s.criteria.versions = s.criteria.versions.map(v => v.id);
          }
          return s;
        })
        .filter(s => !s.criteria || s.criteria.versions.includes(data.wcag_version));
      const auditItemDataToCreate = [];
      for (const chapter of data.audit_chapters) {
        let chapterItems = filteredItems.filter(i => i.system_audit_chapter_section_id === chapter);
        if (data.audit_type_id === 'ATAG') {
          chapterItems = chapterItems.filter(i => i.level && WCAG_LEVELS_MAP[data.conformance_target].includes(i.level));
        }
        for (let chapterItem of chapterItems) {
          if (data.audit_type_id === 'VPAT') {
            for (let itemType of chapterItem.types) {
              auditItemDataToCreate.push({
                audit_id: audit.id,
                system_audit_chapter_section_item_type_id: itemType.id,
                system_audit_chapter_section_item_id: chapterItem.id
              });
            }
          } else {
            auditItemDataToCreate.push({
              audit_id: audit.id,
              system_audit_chapter_section_item_type_id: 'FULL',
              system_audit_chapter_section_item_id: chapterItem.id
            });
          }
        }
      }
      await AuditItem.bulkCreate(auditItemDataToCreate, { transaction });
      await transaction.commit();
      return audit.toJSON();
    } catch (e) {
      console.log('Error creating audit: ', e);
      await transaction.rollback();
    }
  }

  /**
   * Finds a list of audits
   * @param {Object} input
   * @param {Number} input.id - The ID of the audit to find.
   * @param {String} input.search - Search string to filter the audit records.
   * @param {Number} input.page - The page of audit records to return.
   * @param {Number} input.limit - The number of audit records to return per page.
   * @param {Object} opt
   * @param {Boolean} opt.detailed - If true, includes detailed information about the audit records.
   * @returns - The paginated audit records.
   */
  static async find(input = {}, opt = {}) {
    const schema = Joi.object({
      id: Joi.id().optional(),
      search: Joi.metaSearch(),
      page: Joi.metaPage(),
      limit: Joi.metaLimit(true)
    });
    const data = await joiLib.validate(schema, input);
    try {
      const where = {},
        order = [['start_date', 'DESC']],
        include = [];
      const Audit = getModel('audit');
      if (data.id) {
        return await this.read({ id: data.id });
      }
      if (data.search) {
        where.identifier = {
          [Op.like]: `%${data.search}%`
        };
      }
      if (opt.detailed) {
        include.push({
          model: getModel('project'),
          as: 'project',
          attributes: ['id', 'name', 'image', 'connected']
        });
        include.push({
          model: getModel('environment'),
          as: 'environment',
          attributes: ['id', 'name', 'url']
        });
        include.push({
          model: getModel('environmentTest'),
          as: 'test',
          attributes: ['id', 'name', 'status', 'start_date', 'end_date']
        });
        include.push({
          model: getModel('profile'),
          as: 'profile',
          attributes: ['id', 'first_name', 'last_name', 'title']
        });
        include.push({
          model: getModel('systemAuditType'),
          as: 'type',
          attributes: ['id', 'name']
        });
        include.push({
          model: getModel('systemAuditTypeVersion'),
          as: 'version',
          attributes: ['id', 'name']
        });
        include.push({
          model: getModel('systemAuditChapterSection'),
          as: 'chapters',
          attributes: ['id', 'name'],
          through: {
            attributes: []
          }
        });
      }
      const qry = CoreLib.paginateQuery({ where, order, include }, data, opt);
      const res = await Audit.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding audits: ', e);
    }
  }

  /**
   * Finds a single audit record by id
   * @param {Object} input
   * @param {string} input.id - The ID of the audit record to find.
   * @param {{}} [opt]
   * @return - The audit object
   */
  static async read(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Audit = getModel('audit');
      const res = await Audit.findByPk(data.id, {
        include: [
          {
            model: getModel('project'),
            as: 'project',
            attributes: ['id', 'name', 'image', 'connected']
          },
          {
            model: getModel('environment'),
            as: 'environment',
            attributes: ['id', 'name', 'url']
          },
          {
            model: getModel('environmentTest'),
            as: 'test',
            attributes: ['id', 'name', 'status', 'start_date', 'end_date']
          },
          {
            model: getModel('profile'),
            as: 'profile',
            attributes: ['id', 'first_name', 'last_name', 'title']
          },
          {
            model: getModel('systemAuditType'),
            as: 'type',
            attributes: ['id', 'name']
          },
          {
            model: getModel('systemAuditTypeVersion'),
            as: 'version',
            attributes: ['id', 'name']
          },
          {
            model: getModel('systemAuditChapterSection'),
            as: 'chapters',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ]
      });
      return res.toJSON();
    } catch (e) {
      console.log('Error finding audit: ', e);
    }
  }

  /**
   * Updates an existing audit.
   * @param {Object} input
   * @param {string} input.id The ID of the audit to update.
   * @param {string} [input.status] The status of the audit.
   * @param {string} [input.conformance_target] The conformance target for the audit.
   * @param {string} [input.identifier] A unique identifier for the audit.
   * @param {string} [input.project_id] The ID of the associated project.
   * @param {string} [input.environment_id] The ID of the associated environment.
   * @param {string} [input.environment_test_id] The ID of the associated environment test.
   * @param {string} [input.profile_id] The ID of the associated profile.
   * @param {string} [input.audit_type_id] The ID of the audit type.
   * @param {string} [input.audit_type_version_id] The ID of the audit type version.
   * @param {Array<string>} [input.audit_chapters] Array of audit chapter IDs.
   * @param {Date} [input.start_date] The start date of the audit.
   * @param {string} [input.product_name] The name of the product being audited.
   * @param {string} [input.product_version] The version of the product being audited.
   * @param {string} [input.product_description] A description of the product.
   * @param {string} [input.product_url] The URL of the product.
   * @param {string} [input.vendor_name] The name of the vendor.
   * @param {string} [input.vendor_address] The address of the vendor.
   * @param {string} [input.vendor_url] The URL of the vendor.
   * @param {string} [input.vendor_contact_name] The contact name at the vendor.
   * @param {string} [input.vendor_contact_email] The contact email at the vendor.
   * @param {string} [input.vendor_contact_phone] The contact phone number at the vendor.
   * @param {string} [input.notes] Any additional notes about the audit.
   * @param {string} [input.methods] The methods used in the audit.
   * @param {string} [input.disclaimer] Any disclaimers related to the audit.
   * @param {string} [input.repository_url] The URL of the repository being audited.
   * @param {string} [input.feedback] Feedback related to the audit.
   * @param {string} [input.license] The licensing information for the audit.
   * @param {string} [input.summary] A summary of the audit.
   * @param {{}} [opt]
   * @returns - The updated audit object.
   * @throws Will throw an error if the audit is not found or update fails.
   */
  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required(),
        wcag_version: Joi.string().optional().allow(null, ''),
        status: Joi.enum(AUDIT_STATUS).optional().allow(null, ''),
        conformance_target: Joi.enum(CONFORMANCE_TARGETS).optional().allow(null, ''),
        identifier: Joi.string().optional().allow(null, ''),
        project_id: Joi.id().optional().allow(null, ''),
        environment_id: Joi.id().optional().allow(null, ''),
        environment_test_id: Joi.id().optional().allow(null, ''),
        profile_id: Joi.id().optional().allow(null, ''),
        audit_type_id: Joi.string().optional().allow(null, ''),
        audit_type_version_id: Joi.string().optional().allow(null, ''),
        audit_chapters: Joi.array().items(Joi.string()).optional().allow(null, ''),
        start_date: Joi.date().optional().allow(null, ''),
        product_name: Joi.string().optional().allow(null, ''),
        product_version: Joi.string().optional().allow(null, ''),
        product_description: Joi.string().optional().allow(null, ''),
        product_url: Joi.string().optional().allow(null, ''),
        vendor_name: Joi.string().optional().allow(null, ''),
        vendor_address: Joi.string().optional().allow(null, ''),
        vendor_url: Joi.string().optional().allow(null, ''),
        vendor_contact_name: Joi.string().optional().allow(null, ''),
        vendor_contact_email: Joi.string().optional().allow(null, ''),
        vendor_contact_phone: Joi.string().optional().allow(null, ''),
        notes: Joi.string().optional().allow(null, ''),
        methods: Joi.string().optional().allow(null, ''),
        disclaimer: Joi.string().optional().allow(null, ''),
        repository_url: Joi.string().optional().allow(null, ''),
        feedback: Joi.string().optional().allow(null, ''),
        license: Joi.string().optional().allow(null, ''),
        summary: Joi.string().optional().allow(null, '')
      })
    );
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const Audit = getModel('audit');
      const audit = await Audit.findByPk(data.id);
      if (!audit) {
        throw new Error('Audit not found');
      }
      if (data.status) {
        audit.status = data.status;
      }
      if (data.wcag_version) {
        audit.wcag_version = data.wcag_version;
      }
      if (data.conformance_target) {
        audit.conformance_target = data.conformance_target;
      }
      if (data.identifier) {
        audit.identifier = data.identifier;
      }
      if (data.project_id) {
        audit.project_id = data.project_id;
      }
      if (data.environment_id) {
        audit.environment_id = data.environment_id;
      }
      if (data.environment_test_id) {
        audit.environment_test_id = data.environment_test_id;
      }
      if (data.profile_id) {
        audit.profile_id = data.profile_id;
      }
      if (data.audit_type_id) {
        audit.system_audit_type_id = data.audit_type_id;
      }
      if (data.audit_type_version_id) {
        audit.system_audit_type_version_id = data.audit_type_version_id;
      }
      if (data.start_date) {
        audit.start_date = data.start_date;
      }
      if (data.product_name) {
        audit.product_name = data.product_name;
      }
      if (data.product_version) {
        audit.product_version = data.product_version;
      }
      if (data.product_description) {
        audit.product_description = data.product_description;
      }
      if (data.product_url) {
        audit.product_url = data.product_url;
      }
      if (data.vendor_name) {
        audit.vendor_name = data.vendor_name;
      }
      if (data.vendor_address) {
        audit.vendor_address = data.vendor_address;
      }
      if (data.vendor_url) {
        audit.vendor_url = data.vendor_url;
      }
      if (data.vendor_contact_name) {
        audit.vendor_contact_name = data.vendor_contact_name;
      }
      if (data.vendor_contact_email) {
        audit.vendor_contact_email = data.vendor_contact_email;
      }
      if (data.vendor_contact_phone) {
        audit.vendor_contact_phone = data.vendor_contact_phone;
      }
      if (data.notes) {
        audit.notes = data.notes;
      }
      if (data.methods) {
        audit.methods = data.methods;
      }
      if (data.disclaimer) {
        audit.disclaimer = data.disclaimer;
      }
      if (data.repository_url) {
        audit.repository_url = data.repository_url;
      }
      if (data.feedback) {
        audit.feedback = data.feedback;
      }
      if (data.license) {
        audit.license = data.license;
      }
      if (data.summary) {
        audit.summary = data.summary;
      }
      await audit.save({ transaction });
      if (data.audit_chapters && data.audit_chapters.length > 0) {
        await audit.setChapters(data.audit_chapters, { transaction });
      }
      await transaction.commit();
      return audit.toJSON();
    } catch (e) {
      console.log('Error updating audit: ', e);
      await transaction.rollback();
    }
  }

  /**
   * Delete an audit.
   * @param {Object} input
   * @param {Number} input.id - the audit id
   * @param {Object} opt
   */
  static async delete(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Audit = getModel('audit');
      const audit = await Audit.findByPk(data.id);
      if (!audit) {
        throw new Error('Audit not found');
      }
      await audit.destroy();
      return { success: true, message: 'Audit deleted successfully' };
    } catch (e) {
      console.log('Error deleting audit: ', e);
      return { success: false, message: 'Error deleting audit' };
    }
  }

  /**
   * Finds all audit report items for the given audit.
   * @param {Object} input
   * @param {Number} input.id - the audit id
   * @param {Object} opt
   * @returns - the audit object with sections
   */
  static async findAuditReportItems(input = {}, opt = {}) {
    const schema = Joi.object({
      id: Joi.id().required()
    });
    const data = await joiLib.validate(schema, input);
    try {
      const Audit = getModel('audit'),
        AuditItem = getModel('auditItem');
      const auditObj = await Audit.findByPk(data.id, {
        include: [
          {
            model: getModel('profile'),
            as: 'profile',
            attributes: ['id', 'first_name', 'last_name', 'title'],
            include: [
              {
                model: getModel('profileOrganization'),
                as: 'organization',
                attributes: ['id', 'name', 'email', 'phone', 'url']
              }
            ]
          },
          {
            model: getModel('project'),
            as: 'project',
            attributes: ['id', 'name', 'connected']
          },
          {
            model: getModel('environment'),
            as: 'environment',
            attributes: ['id', 'name', 'url']
          }
        ]
      });
      if (!auditObj) {
        throw new Error('Audit not found');
      }

      const auditItems = await AuditItem.findAll({
        where: {
          audit_id: data.id
        },
        include: [
          {
            model: getModel('systemAuditChapterSectionItem'),
            as: 'item',
            attributes: ['id', 'name', 'level', 'system_standard_criteria_id'],
            include: [
              {
                model: getModel('systemAuditChapterSection'),
                as: 'section',
                attributes: ['id', 'name', 'table_name', 'url', 'system_audit_chapter_id']
              },
              {
                model: getModel('systemStandardCriteria'),
                as: 'criteria',
                attributes: ['id', 'name', 'description', 'level', 'help_url']
              }
            ]
          },
          {
            model: getModel('systemAuditChapterSectionItemType'),
            as: 'type',
            attributes: ['id']
          }
        ]
      });

      const sectionsMap = {};
      for (let auditItem of auditItems) {
        auditItem = auditItem.toJSON();
        const sectionId = auditItem.item.section.id;
        const itemId = auditItem.item.id;
        if (!sectionsMap[sectionId]) {
          sectionsMap[sectionId] = {
            id: auditItem.item.section.id,
            name: auditItem.item.section.name,
            table_name: auditItem.item.section.table_name,
            url: auditItem.item.section.url,
            chapter_id: auditItem.item.section.system_audit_chapter_id,
            itemsMap: {}
          };
        }
        const sectionObj = sectionsMap[sectionId];
        if (!sectionObj.itemsMap[itemId]) {
          sectionObj.itemsMap[itemId] = {
            id: auditItem.item.id,
            name: auditItem.item.name,
            level: auditItem.item.level,
            criteria: auditItem.item.criteria,
            types: []
          };
        }
        sectionObj.itemsMap[itemId].types.push({
          id: auditItem.type.id,
          level: auditItem.level,
          remarks: auditItem.remarks
        });
        delete auditItem.item;
        delete auditItem.type;
      }

      const audit = auditObj.toJSON();
      audit.sections = Object.values(sectionsMap)
        .map((section) => {
          const items = Object.values(section.itemsMap);
          delete section.itemsMap;
          section.items = items;
          return section;
        })
        .sort((a, b) => {
          return SECTION_SORT_PRIORITY.indexOf(a.id) - SECTION_SORT_PRIORITY.indexOf(b.id);
        });

      return audit;
    } catch (e) {
      console.log('Error finding audit report items: ', e);
    }
  }

  /**
   * Updates an audit report item with the given details.
   * @param {Object} input
   * @param {String} input.id - The ID of the audit to update.
   * @param {String} input.item_id - The ID of the section item to update.
   * @param {String} input.item_type_id - The ID of the item type.
   * @param {String} input.level - The level of conformance for the audit item.
   * @param {String} [input.remarks] - Optional remarks for the audit item.
   * @param {Object} opt
   * @returns - The updated audit item as a JSON object.
   * @throws Will throw an error if the audit or audit item is not found.
   */
  static async updateAuditReportItem(input = {}, opt = {}) {
    const schema = Joi.object({
      id: Joi.id().required(),
      item_id: Joi.string().required(),
      item_type_id: Joi.string().required(),
      level: Joi.enum(AUDIT_ITEM_LEVEL_VALUES).required().allow(''),
      remarks: Joi.string().optional().allow('', null)
    });
    const data = await joiLib.validate(schema, input);
    const transaction = await sequelize.transaction();
    try {
      const Audit = getModel('audit'),
        AuditItem = getModel('auditItem');
      const audit = await Audit.findByPk(data.id);
      if (!audit) {
        throw new Error('Audit not found');
      }
      const auditItem = await AuditItem.findOne({
        where: {
          audit_id: data.id,
          system_audit_chapter_section_item_id: data.item_id,
          system_audit_chapter_section_item_type_id: data.item_type_id
        }
      });
      if (!auditItem) {
        throw new Error('Audit item not found');
      }
      auditItem.level = data.level;
      if (data.remarks !== undefined) {
        auditItem.remarks = data.remarks;
      }
      await auditItem.save({ transaction });
      if (audit.status === 'OPEN') {
        audit.status = 'IN_PROGRESS';
      } else if (audit.status === 'IN_PROGRESS') {
        const hasUnresolvedAuditItem = AuditItem.findOne({
          where: {
            audit_id: data.id,
            level: null
          }
        });
        if (!hasUnresolvedAuditItem) {
          audit.status = 'COMPLETED';
        }
      }
      await audit.save({ transaction });
      await transaction.commit();
      return auditItem.toJSON();
    } catch (e) {
      console.log('Error updating audit report items: ', e);
    }
  }

  /**
   * Finds a list of audit types.
   * @param {Object} input
   * @param {String} input.search - Search string to filter audit types by name.
   * @param {Number} input.page - The page of audit types to return.
   * @param {Number} input.limit - The number of audit types to return per page.
   * @param {Object} opt
   * @param {Boolean} opt.detailed - If true, includes version information about the audit types.
   * @returns - The paginated audit types.
   */
  static async findAuditTypes(input = {}, opt = {}) {
    const schema = Joi.object({
      search: Joi.metaSearch(),
      page: Joi.metaPage(),
      limit: Joi.metaLimit(true)
    });
    const data = await joiLib.validate(schema, input);
    try {
      const where = {},
        include = [];
      const AuditType = getModel('systemAuditType');
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      if (opt.detailed) {
        include.push({
          model: getModel('systemAuditTypeVersion'),
          as: 'versions',
          attributes: ['id', 'name']
        });
      }
      const qry = CoreLib.paginateQuery({ where, include }, data, opt);
      const res = await AuditType.findAll(qry);
      return CoreLib.paginateResult(res, data);
    } catch (e) {
      console.log('Error finding audit types: ', e);
    }
  }

  /**
   * Finds a list of audit chapters.
   * @param {Object} input
   * @param {String} input.audit_type_id - The ID of the audit type.
   * @param {String} [input.audit_type_version_id] - The ID of the audit type version.
   * @param {String} input.search - Search string to filter audit chapters by name.
   * @param {Object} opt
   * @param {Boolean} opt.detailed - If true, includes version information about the audit chapters.
   * @returns - The audit chapters.
   */
  static async findAuditChapters(input = {}, opt = {}) {
    const schema = Joi.object({
      audit_type_id: Joi.string().required(),
      audit_type_version_id: Joi.string().optional().allow('', null),
      search: Joi.metaSearch()
    });
    const data = await joiLib.validate(schema, input);
    try {
      const where = {},
        systemAuditTypeWhere = {},
        include = [];
      const SystemAuditChapter = getModel('systemAuditChapter');
      if (data.audit_type_id) {
        systemAuditTypeWhere.system_audit_type_id = data.audit_type_id;
      }
      systemAuditTypeWhere.system_audit_type_version_id = data.audit_type_version_id || '';
      if (data.search) {
        where.name = {
          [Op.like]: `%${data.search}%`
        };
      }
      include.push({
        model: getModel('systemAuditChapterAuditTypeVersion'),
        as: 'audit_type_versions',
        where: systemAuditTypeWhere
      });
      if (opt.detailed) {
        include.push({
          model: getModel('systemAuditChapterSection'),
          as: 'sections',
          attributes: ['id', 'name']
        });
      }
      const res = await SystemAuditChapter.findAll({ where, include });
      return res.map((r) => {
        r = r.toJSON();
        delete r.audit_type_versions;
        return r;
      });
    } catch (e) {
      console.log('Error finding audit chapters: ', e);
    }
  }

  /**
   * Retrieves audit stats
   * @param {Object} input
   * @param {string} input.id - audit id
   * @param {{}} opt
   * @returns - An object containing audit stats
   * @throws Will throw an error if audit is not found
   */
  static async getStats(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Audit = getModel('audit'),
        AuditItem = getModel('auditItem');
      const audit = await Audit.findByPk(data.id);
      if (!audit) {
        throw new Error('Audit not found');
      }
      const auditCounts = await AuditItem.findAll({
        attributes: [
          [literal('COUNT(*)'), 'total'],
          [literal('COUNT(CASE WHEN `auditItem`.`level` IS NOT NULL THEN 1 END)'), 'level_count']
        ],
        include: [
          {
            model: getModel('systemAuditChapterSectionItem'),
            as: 'item',
            attributes: ['id', 'name', 'system_audit_chapter_section_id']
          }
        ],
        group: ['`item`.`system_audit_chapter_section_id`'],
        where: {
          audit_id: data.id
        }
      });
      for (let i = 0; i < auditCounts.length; i++) {
        auditCounts[i] = auditCounts[i].toJSON();
      }
      const levelCounts = await AuditItem.findAll({
        attributes: ['level', [literal('COUNT(*)'), 'total']],
        group: ['level'],
        where: {
          audit_id: data.id
        }
      });
      for (let i = 0; i < levelCounts.length; i++) {
        levelCounts[i] = levelCounts[i].toJSON();
      }
      const { total, updated } = auditCounts.reduce(
        (a, b) => ({
          total: a.total + b.total,
          updated: a.updated + b.level_count
        }),
        {
          total: 0,
          updated: 0
        }
      );

      const items = auditCounts
        .map(audit => ({
          id: audit.item.system_audit_chapter_section_id,
          total: audit.total,
          updated: audit.level_count
        }))
        .sort((a, b) => {
          return SECTION_SORT_PRIORITY.indexOf(a.id) - SECTION_SORT_PRIORITY.indexOf(b.id);
        });

      const levels = levelCounts.reduce((acc, { level, ...rest }) => {
        acc[level || 'NOT_CHECKED'] = rest;
        return acc;
      }, {});

      return {
        total,
        updated,
        items,
        levels
      };
    } catch (e) {
      console.log('Error getting audit stats: ', e);
    }
  }

  /**
   * Generates a report for the audit.
   * @param {Object} input
   * @param {String} input.id - audit id
   * @param {Boolean} [input.is_preview] - Whether to generate a preview report or not.
   * @param {String} [input.format] - The format of the report.
   * @returns - the buffer and report name
   * @throws Will throw an error if the audit is not found.
   */
  static async generateReport(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        id: Joi.id().required(),
        is_preview: Joi.boolean().optional(),
        format: Joi.enum(Object.values(REPORT_FORMATS)).default(REPORT_FORMATS.PDF)
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const Audit = getModel('audit'),
        AuditItem = getModel('auditItem');
      const audit = await Audit.findByPk(data.id, {
        include: [
          {
            model: getModel('project'),
            as: 'project',
            attributes: ['id', 'name']
          },
          {
            model: getModel('environment'),
            as: 'environment',
            attributes: ['id', 'name', 'url']
          },
          {
            model: getModel('profile'),
            as: 'profile',
            attributes: ['id', 'first_name', 'last_name', 'title'],
            include: [
              {
                model: getModel('profileOrganization'),
                as: 'organization',
                attributes: ['id', 'name', 'email', 'phone', 'address', 'address_2', 'city', 'zip_code', 'url'],
                include: [
                  {
                    model: getModel('systemCountry'),
                    as: 'country',
                    attributes: ['id', 'name']
                  },
                  {
                    model: getModel('systemState'),
                    as: 'state',
                    attributes: ['id', 'name']
                  }
                ]
              }
            ]
          }
        ]
      });
      if (!audit) {
        throw new Error('Audit not found');
      }
      const name = `${strToCase(audit.identifier, 'kebab')}-${audit.project.name}-${formatDate(new Date(), 'MM-dd-yyyy-HH-mm')}${data.is_preview ? '-preview' : ''}`;
      if (data.format === REPORT_FORMATS.JSON) {
        const json = {
          evaluationData: {},
          meta: {
            name: audit.identifier,
            website: audit.environment.url,
            executiveSummary: audit.summary,
            conformanceTarget: audit.conformance_target,
            wcagVersion: audit.wcag_version,
            notes: audit.notes,
            methods: audit.methods,
            disclaimer: audit.disclaimer,
            repositoryUrl: audit.repository_url,
            feedback: audit.feedback,
            license: audit.license,
            product: {
              name: audit.product_name,
              version: audit.product_version,
              description: audit.product_description,
              url: audit.product_url
            },
            vendor: {
              name: audit.vendor_name,
              address: audit.vendor_address,
              url: audit.vendor_url,
              contact: {
                name: audit.vendor_contact_name,
                email: audit.vendor_contact_email,
                phone: audit.vendor_contact_phone
              }
            },
            evaluator: {
              name: `${audit.profile.first_name} ${audit.profile.last_name}`,
              title: audit.profile.title
            },
            start_date: formatDate(audit.start_date),
            download_date: formatDate(new Date())
          }
        };
        if (audit.profile.organization) {
          const jsonOrganization = {
            name: audit.profile.organization.name,
            contact: {
              email: audit.profile.organization.email,
              phone: audit.profile.organization.phone
            },
            address: {
              address: audit.profile.organization.address,
              address_2: audit.profile.organization.address_2,
              city: audit.profile.organization.city,
              zip_code: audit.profile.organization.zip_code,
              country: {
                code: audit.profile.organization.country.id,
                name: audit.profile.organization.country.name
              }
            }
          };
          if (audit.profile.organization.state) {
            jsonOrganization.address.state = {
              code: audit.profile.organization.state.id,
              name: audit.profile.organization.state.name
            };
          }
          if (audit.profile.organization.country) {
            jsonOrganization.address.country = {
              code: audit.profile.organization.country.id,
              name: audit.profile.organization.country.name
            };
          }
          json.meta.evaluator.organization = jsonOrganization;
        }
        const auditWithItems = await this.findAuditReportItems({ id: audit.id });
        const auditItems = auditWithItems.sections.flatMap(section => section.items);
        let levelKey = '',
          remarksKey = '';
        if (audit.system_audit_type_id === 'VPAT') {
          levelKey = 'level';
          remarksKey = 'remarks';
        } else {
          levelKey = 'result';
          remarksKey = 'observations';
        }
        for (const auditItem of auditItems) {
          const id = strToCase(auditItem.name, 'kebab');
          const level = auditItem.level || auditItem.criteria?.level || null;
          json.evaluationData[id] = {
            name: auditItem.name,
            level: null,
            evaluatedLevel: null
          };
          if (auditItem.types.length === 1) {
            const type = auditItem.types[0];
            json.evaluationData[id][levelKey] = type.level ? LEVELS[type.level] : 'Not checked';
            json.evaluationData[id][remarksKey] = type.remarks;
          } else {
            for (const type of auditItem.types) {
              json.evaluationData[id][strToCase(type.id, 'camel')] = {
                [levelKey]: type.level ? LEVELS[type.level] : 'Not checked',
                [remarksKey]: type.remarks
              };
            }
          }
          if (level) {
            const evaluatedLevelIndex = Math.min(WCAG_LEVELS.indexOf(level), WCAG_LEVELS.indexOf(audit.conformance_target));
            json.evaluationData[id].level = level;
            json.evaluationData[id].evaluatedLevel = `Level ${WCAG_LEVELS[evaluatedLevelIndex]}`;
          }
        }
        const string = JSON.stringify(json, null, 2);
        const buffer = Buffer.from(string, 'utf-8');
        return { buffer, name };
      }
      const Report = new ReportLib(REPORT_TYPES.AUDIT, { id: data.id, audit_type: audit.system_audit_type_id }, data.format, { header: { title: audit.product_name || audit.project.name } });
      const pdfBuffer = await Report.start();
      return { buffer: pdfBuffer, name };
    } catch (e) {
      console.log('Error generating audit report: ', e);
    }
  }
}

export default AuditLib;
