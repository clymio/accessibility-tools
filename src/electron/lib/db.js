import { DB_NAME, IS_DEVELOPMENT } from '@/constants/app';
import { app } from 'electron';
import log from 'electron-log';
import { readdirSync, statSync } from 'fs-extra';
import path from 'path';
import { Op, Sequelize } from 'sequelize';
import { pathToFileURL } from 'url';
import RemediationLib from './remediation';
import SettingsLib from './settings';
import TestCaseLib from './testCase';

if (IS_DEVELOPMENT) {
  const devName = `${app.getName()}-dev`;
  const defaultPath = app.getPath('userData');
  const newPath = defaultPath.replace(app.getName(), devName);
  app.setPath('userData', newPath);
}
const dbDirectoryPath = app.isPackaged ? app.getPath('userData') : process.cwd();
const dbPath = path.join(dbDirectoryPath, DB_NAME);

log.info('db path:', dbPath);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  dialectOptions: {
    busyTimeout: 5000 // Wait up to 5 seconds before erroring out
  },
  retry: {
    max: 3,
    backoffBase: 1000,
    backoffExponent: 1.5,
    match: [/SQLITE_BUSY/]
  }
});

const originalDefine = sequelize.define;

sequelize.define = function (modelName, attributes, options = {}) {
  const updatedOptions = { ...options, underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' };
  return originalDefine.call(this, modelName, attributes, updatedOptions);
};

/**
 * gets the db model files recursively from all folders
 * @param {string} dir the dir to read
 * @param {string?} parent the parent folder path (default is ''). Used to keep track of the folder path when traversing root dir recursively
 * @returns db model files (with .js extension)
 */
function getDbModelFiles(dir, parent = '') {
  const files = readdirSync(dir);
  let jsFiles = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      const subfolderFiles = getDbModelFiles(fullPath, path.join(parent, file));
      jsFiles = jsFiles.concat(subfolderFiles);
    } else if (file.endsWith('.js')) {
      const filePath = path.join(parent, file);
      jsFiles.push(filePath);
    }
  }

  return jsFiles;
}

// load all models from the /models directory
async function loadModels() {
  const modelsDir = path.resolve(__dirname, '../db/models');
  const modelFiles = getDbModelFiles(modelsDir);
  await Promise.all(
    modelFiles.map(async (file) => {
      const modelPath = pathToFileURL(path.resolve(modelsDir, file)).href;
      const modelModule = await import(modelPath).then(m => m.default);
      modelModule.default(sequelize, Sequelize.DataTypes);
    })
  );
  Object.keys(sequelize.models).forEach((modelName) => {
    const model = getModel(modelName);
    if (model.associate) {
      model.associate(sequelize.models);
    }
  });
}

/**
 * retrieve all migration files and apply them to the database if skip = false
 * If skip = true, add migrations to db without applying them
 * @param {*} skip
 */
async function runMigrations(skip = false) {
  const Migration = getModel('migration');
  const migrationDir = path.resolve(__dirname, '../db/migrations');
  const migrationFiles = readdirSync(migrationDir)
    .filter(file => file.endsWith('.js'))
    .sort((a, b) => {
      const [versionA] = a.split('-');
      const [versionB] = b.split('-');
      const [majorA, minorA, patchA] = versionA.split('.').map(Number);
      const [majorB, minorB, patchB] = versionB.split('.').map(Number);
      if (majorA !== majorB) return majorA - majorB;
      if (minorA !== minorB) return minorA - minorB;
      return patchA - patchB;
    });
  for (const file of migrationFiles) {
    const migrationFileName = file.replace('.js', '');
    const [migrationRecord, created] = await Migration.findOrCreate({ where: { name: migrationFileName } });
    if (!created && migrationRecord.applied_at) {
      log.info(`skipping migration ${migrationFileName} (already applied)`);
      continue;
    }
    if (skip) {
      log.info(`skipping migration ${migrationFileName}`);
      migrationRecord.applied_at = new Date();
      await migrationRecord.save();
    } else {
      log.info(`applying migration ${migrationFileName}...`);
      const modelPath = pathToFileURL(path.resolve(migrationDir, file)).href;
      const migrationModule = await import(modelPath).then(m => m.default);
      if (!migrationModule.default) {
        log.error(`Error applying migration ${migrationFileName}: migration module not found`);
        continue;
      }
      const { up, down } = migrationModule.default;
      try {
        await up(sequelize.getQueryInterface(), sequelize.Sequelize);
        log.info(`migration ${migrationFileName} applied successfully`);
        migrationRecord.applied_at = new Date();
        await migrationRecord.save();
      } catch (e) {
        console.log(e);
        await down(sequelize.getQueryInterface(), sequelize.Sequelize);
        log.error(`Error applying migration ${migrationFileName}`);
        await migrationRecord.destroy();
        throw e;
      }
    }
  }
}

function getModel(modelName) {
  return sequelize.model(modelName);
}

/**
 * Load system data from the systemData.json file in the db folder into the database.
 * The data is stored in the following tables:
 * - system_standard
 * - system_standard_version
 * - system_standard_principle
 * - system_standard_guideline
 * - system_standard_criteria
 * - system_remediation_category
 * - system_remediation_category_technique
 * - test_cases
 * - remediations
 * - technologies
 * - system_environment
 * - system_axe_rules
 * - system_audit_types
 * - system_audit_type_versions
 * - system_audit_chapters
 * - system_audit_chapter_sections
 * - system_audit_chapter_section_items
 * - system_audit_chapter_section_item_types
 * - system_audit_chapter_audit_type_version
 */
async function loadSystemData() {
  try {
    const systemDataJsonPath = path.resolve(__dirname, '../db/systemData.json');
    const systemDataJson = require(systemDataJsonPath);
    const {
      standards,
      versions,
      principles,
      guidelines,
      criteria,
      testCases,
      technologies,
      categories,
      techniques,
      remediations,
      environments,
      axeRules,
      countries,
      auditTypes,
      auditTypeVersions,
      auditChapters,
      auditChapterSections,
      auditChapterSectionItems,
      auditChapterSectionItemTypes
    } = systemDataJson;
    const SystemStandard = getModel('systemStandard'),
      SystemStandardVersion = getModel('systemStandardVersion'),
      SystemStandardPrinciple = getModel('systemStandardPrinciple'),
      SystemStandardGuideline = getModel('systemStandardGuideline'),
      SystemStandardCriteria = getModel('systemStandardCriteria'),
      SystemCategory = getModel('systemCategory'),
      TestCase = getModel('testCase'),
      Remediation = getModel('remediation'),
      Technology = getModel('technology'),
      SystemEnvironment = getModel('systemEnvironment'),
      SystemAxeRules = getModel('systemAxeRules'),
      SystemContinent = getModel('systemContinent'),
      SystemCountry = getModel('systemCountry'),
      SystemState = getModel('systemState'),
      SystemAuditType = getModel('systemAuditType'),
      SystemAuditTypeVersion = getModel('systemAuditTypeVersion'),
      SystemAuditChapter = getModel('systemAuditChapter'),
      SystemAuditChapterSection = getModel('systemAuditChapterSection'),
      SystemAuditChapterSectionItem = getModel('systemAuditChapterSectionItem'),
      SystemAuditChapterSectionItemType = getModel('systemAuditChapterSectionItemType'),
      SystemAuditChapterAuditTypeVersion = getModel('systemAuditChapterAuditTypeVersion');

    // init settings
    await SettingsLib.init(dbDirectoryPath);

    // load axe rules
    for (const rule of axeRules) {
      await SystemAxeRules.upsert({ id: rule.id, description: rule.description, help: rule.help, helpUrl: rule.helpUrl });
    }
    await deleteRows(
      axeRules.map(r => r.id),
      SystemAxeRules
    );

    // load system standards data
    for (const standard of standards) {
      await SystemStandard.upsert({ id: standard.key, name: standard.name });
    }
    await deleteRows(
      standards.map(s => s.key),
      SystemStandard
    );

    for (const version of versions) {
      await SystemStandardVersion.upsert({ id: version.key, name: version.name, system_standard_id: version.standard });
    }
    await deleteRows(
      versions.map(v => v.key),
      SystemStandardVersion
    );

    for (const principle of principles) {
      const [principleObj] = await SystemStandardPrinciple.upsert({
        id: principle.key,
        name: principle.name,
        description: principle.description,
        system_standard_id: principle.standard
      });
      await principleObj.setVersions(principle.versions);
    }
    await deleteRows(
      principles.map(p => p.key),
      SystemStandardPrinciple
    );

    for (const guideline of guidelines) {
      const [guidelineObj] = await SystemStandardGuideline.upsert({
        id: guideline.key,
        name: guideline.name,
        description: guideline.description,
        system_standard_id: guideline.standard,
        system_standard_principle_id: guideline.principle
      });
      await guidelineObj.setVersions(guideline.versions);
    }
    await deleteRows(
      guidelines.map(g => g.key),
      SystemStandardGuideline
    );

    for (const criterion of criteria) {
      const [criteriaObj] = await SystemStandardCriteria.upsert({
        id: criterion.key,
        name: criterion.name,
        description: criterion.description,
        level: criterion.level,
        help_url: criterion.helpUrl,
        system_standard_id: criterion.standard,
        system_standard_principle_id: criterion.principle,
        system_standard_guideline_id: criterion.guideline
      });
      await criteriaObj.setVersions(criterion.versions);
    }
    await deleteRows(
      criteria.map(c => c.key),
      SystemStandardCriteria
    );

    // load system categories data
    await sequelize.transaction(async (t) => {
      for (const category of categories) {
        await SystemCategory.upsert({ id: category.key, name: category.name, is_system: true }, { transaction: t });
      }
      await deleteRows(
        categories.map(c => c.key),
        SystemCategory,
        { is_system: true },
        { transaction: t }
      );
    });

    // load technologies data
    for (const technology of technologies) {
      await Technology.upsert({ id: technology.key, name: technology.name, is_system: true });
    }
    await deleteRows(
      technologies.map(t => t.key),
      Technology,
      { is_system: true }
    );

    // load environments data
    for (const env of environments) {
      await SystemEnvironment.upsert({ id: env.key, name: env.name, is_system: true });
    }
    await deleteRows(
      environments.map(e => e.key),
      SystemEnvironment,
      { is_system: true }
    );

    // load countries data
    await sequelize.transaction(async (t) => {
      const continentMap = new Map();
      for (const country of countries) {
        const continent = country.continent;
        if (!continentMap.has(continent.id)) {
          await SystemContinent.upsert({ id: continent.id, name: continent.name, is_system: true }, { transaction: t });
          continentMap.set(continent.id, true);
        }
        await SystemCountry.upsert(
          { id: country.id, name: country.name, phone_prefix: country.phone, short_name: country.short_name, continent_id: continent.id },
          { transaction: t }
        );
        if (country.states && country.states.length > 0) {
          for (const state of country.states) {
            await SystemState.upsert({ id: state.id, name: state.name, country_id: country.id }, { transaction: t });
          }
        }
      }
    });

    // load audits data
    await sequelize.transaction(async (t) => {
      for (const chapter of auditChapters) {
        await SystemAuditChapter.upsert({ id: chapter.key, name: chapter.name }, { transaction: t });
      }
      await deleteRows(
        auditChapters.map(c => c.key),
        SystemAuditChapter,
        {},
        { transaction: t }
      );

      for (const auditType of auditTypes) {
        await SystemAuditType.upsert({ id: auditType.key, name: auditType.name }, { transaction: t });
        if (auditType.chapters && auditType.chapters.length > 0) {
          const bulkData = auditType.chapters.map(c => ({
            system_audit_chapter_id: c,
            system_audit_type_id: auditType.key
          }));
          await SystemAuditChapterAuditTypeVersion.bulkCreate(bulkData, {
            validate: false,
            individualHooks: false,
            updateOnDuplicate: ['system_audit_chapter_id', 'system_audit_type_id'],
            transaction: t
          });
        }
      }

      for (const auditTypeVersion of auditTypeVersions) {
        const [obj] = await SystemAuditTypeVersion.upsert(
          {
            id: auditTypeVersion.key,
            name: auditTypeVersion.name,
            system_audit_type_id: auditTypeVersion.auditType
          },
          {
            transaction: t
          }
        );
        if (!obj.system_audit_type_id) {
          await obj.setType(auditTypeVersion.auditType, { transaction: t });
        }
        if (auditTypeVersion.chapters && auditTypeVersion.chapters.length > 0) {
          const bulkData = auditTypeVersion.chapters.map(c => ({
            system_audit_chapter_id: c,
            system_audit_type_id: auditTypeVersion.auditType,
            system_audit_type_version_id: auditTypeVersion.key
          }));
          await SystemAuditChapterAuditTypeVersion.bulkCreate(bulkData, {
            transaction: t,
            updateOnDuplicate: ['system_audit_chapter_id', 'system_audit_type_id', 'system_audit_type_version_id']
          });
        }
      }
      await deleteRows(
        auditTypeVersions.map(t => t.key),
        SystemAuditTypeVersion,
        {},
        { transaction: t }
      );
      await deleteRows(
        auditTypes.map(t => t.key),
        SystemAuditType,
        {},
        { transaction: t }
      );

      for (const section of auditChapterSections) {
        const [obj] = await SystemAuditChapterSection.upsert(
          {
            id: section.key,
            name: section.name,
            ...(section.table_name ? { table_name: section.table_name } : {}),
            ...(section.url ? { url: section.url } : {}),
            system_audit_chapter_id: section.auditChapter
          },
          {
            transaction: t
          }
        );
        if (!obj.system_audit_chapter_id) {
          await obj.setChapter(section.auditChapter, { transaction: t });
        }
      }
      await deleteRows(
        auditChapterSections.map(s => s.key),
        SystemAuditChapterSection,
        {},
        { transaction: t }
      );

      for (const type of auditChapterSectionItemTypes) {
        await SystemAuditChapterSectionItemType.upsert({ id: type.key }, { transaction: t });
      }
      await deleteRows(
        auditChapterSectionItemTypes.map(t => t.key),
        SystemAuditChapterSectionItemType,
        {},
        { transaction: t }
      );

      for (const item of auditChapterSectionItems) {
        const [obj] = await SystemAuditChapterSectionItem.upsert(
          {
            id: item.key,
            name: item.name,
            level: item.level,
            system_audit_chapter_section_id: item.auditChapterSection,
            system_standard_criteria_id: item.criteria
          },
          {
            transaction: t
          }
        );
        if (!obj.system_audit_chapter_section_id) {
          await obj.setSection(item.auditChapterSection, { transaction: t });
        }
        await obj.setTypes(item.types, { transaction: t });
      }
      await deleteRows(
        auditChapterSectionItems.map(i => i.key),
        SystemAuditChapterSectionItem,
        {},
        { transaction: t }
      );
    });

    // load test cases data
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const testCaseData = {
        id: testCase.id,
        name: testCase.name,
        type: testCase.type,
        instruction: testCase.instruction || '',
        steps: testCase.steps,
        result: testCase.result,
        system_standard_id: testCase.standard,
        system_standard_criteria: testCase.criteria,
        system_category_id: testCase.category,
        axe_rules: testCase.axeRules,
        selectors: testCase.selectors.join('\n')
      };
      const testCaseObj = await TestCase.findByPk(testCase.id, {
        attributes: ['id']
      });
      if (testCaseObj) {
        await TestCaseLib.update(testCaseData);
      } else {
        await TestCaseLib.create(testCaseData, {
          is_system: true
        });
      }
    }
    const testCaseIds = testCases.map(t => t.id);
    // destroy system test cases that are not in the list
    try {
      await TestCase.destroy({
        where: {
          id: {
            [Op.notIn]: testCaseIds
          },
          [Op.or]: [
            { id: { [Op.like]: 'S%' } },
            { id: { [Op.like]: 'TC-%' } }
          ]
        }
      });
    } catch (e) {
      console.log(e);
      log.info('failed to delete testCase rows');
    }

    // load remediations data
    for (let i = 0; i < remediations.length; i++) {
      const remediation = remediations[i];
      const remediationData = {
        id: remediation.id,
        name: remediation.name,
        description: remediation.description,
        system_category_id: remediation.category,
        system_criteria: remediation.criteria,
        selectors: remediation.selectors.join('\n'),
        examples: remediation.examples
      };
      const remediationObj = await Remediation.findByPk(remediation.id, {
        attributes: ['id']
      });
      if (remediationObj) {
        await RemediationLib.update(remediationData);
      } else {
        await RemediationLib.create(remediationData, {
          is_system: true
        });
      }
    }
    const remediationIds = remediations.map(r => r.id);
    try {
      // destroy system remediations that are not in the list
      await Remediation.destroy({
        where: {
          id: {
            [Op.notIn]: remediationIds,
            [Op.like]: 'SYS_REM_%'
          }
        }
      });
    } catch (e) {
      console.log(e);
      log.info('failed to delete remediation rows');
    }
    log.info('System data loaded successfully');
  } catch (e) {
    console.log(e);
    log.error('Error loading system data');
    log.debug(e);
    throw e;
  }
}

/**
 * Deletes all rows in the specified Model that are not in the given data.
 * @param {Object[]} idsToKeep - The ids to keep in the Model
 * @param {Sequelize.Model} Model - The Sequelize Model to delete from
 * @returns
 */
async function deleteRows(idsToKeep, Model, where = {}, opt = {}) {
  await Model.destroy({
    where: {
      id: {
        [Op.notIn]: idsToKeep
      },
      ...where
    },
    ...opt
  });
}

async function boot() {
  try {
    await sequelize.authenticate();
    await loadModels();
    const SystemSync = getModel('systemSync');
    const packageJson = require(path.resolve(__dirname, '../../package.json'));
    const version = packageJson.version;
    let systemSyncObj;
    try {
      systemSyncObj = await SystemSync.findByPk(1);
    } catch (e) {
      log.info('Initializing db...');
    }
    if (!systemSyncObj) {
      await sequelize.sync();
      await runMigrations(true);
      await loadSystemData();
      await SystemSync.create({ id: 1, version });
    } else if (systemSyncObj.version !== version) {
      await runMigrations();
      await sequelize.sync();
      await loadSystemData();
      systemSyncObj.version = version;
      await systemSyncObj.save();
    } else {
      await sequelize.sync();
    }
  } catch (e) {
    log.error('Error booting db');
    log.debug(e);
    throw e;
  }
}

export default sequelize;
export { boot, getModel };
