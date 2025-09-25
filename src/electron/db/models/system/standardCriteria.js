export const STANDARD_CRITERIA_LEVELS = ['A', 'AA', 'AAA'];
export default (sequelize, DataTypes) => {
  const SystemStandardCriteria = sequelize.define('systemStandardCriteria', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    level: {
      type: DataTypes.ENUM,
      values: STANDARD_CRITERIA_LEVELS,
      defaultValue: STANDARD_CRITERIA_LEVELS[0]
    },
    help_url: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  SystemStandardCriteria.associate = (models) => {
    SystemStandardCriteria.hasOne(models.systemAuditChapterSectionItem, {
      foreignKey: 'system_standard_criteria_id',
      as: 'item'
    });
    SystemStandardCriteria.belongsTo(models.systemStandard, {
      foreignKey: 'system_standard_id',
      as: 'standard'
    });
    SystemStandardCriteria.belongsTo(models.systemStandardPrinciple, {
      foreignKey: 'system_standard_principle_id',
      as: 'principle'
    });
    SystemStandardCriteria.belongsTo(models.systemStandardGuideline, {
      foreignKey: 'system_standard_guideline_id',
      as: 'guideline'
    });
    SystemStandardCriteria.belongsToMany(models.systemStandardVersion, {
      foreignKey: 'system_standard_criteria_id',
      as: 'versions',
      through: 'system_version_criteria'
    });
    SystemStandardCriteria.belongsToMany(models.testCase, {
      foreignKey: 'system_standard_criteria_id',
      as: 'test_cases',
      through: 'test_case_criteria'
    });
    SystemStandardCriteria.belongsToMany(models.remediation, {
      foreignKey: 'system_standard_criteria_id',
      as: 'remediations',
      through: 'remediation_criteria'
    });
  };

  return SystemStandardCriteria;
};
