export const TEST_CASE_TYPE_VALUES = ['MANUAL', 'AUTOMATIC'];

export default (sequelize, DataTypes) => {
  const TestCase = sequelize.define('testCase', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: TEST_CASE_TYPE_VALUES,
      defaultValue: TEST_CASE_TYPE_VALUES[0]
    },
    steps: {
      type: DataTypes.TEXT
    },
    result: {
      type: DataTypes.TEXT
    },
    instruction: {
      type: DataTypes.TEXT
    },
    selectors: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: ['body']
    },
    is_selected: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  TestCase.associate = (models) => {
    TestCase.belongsTo(models.systemStandard, {
      foreignKey: 'system_standard_id',
      as: 'standard'
    });
    TestCase.belongsTo(models.systemCategory, {
      foreignKey: 'system_category_id',
      as: 'category'
    });
    TestCase.hasMany(models.testCaseEnvironmentTestPage, {
      foreignKey: 'test_case_id',
      as: 'pages'
    });
    TestCase.belongsToMany(models.remediation, {
      foreignKey: 'test_case_id',
      as: 'remediations',
      through: 'test_case_remediations'
    });
    TestCase.belongsToMany(models.systemAxeRules, {
      foreignKey: 'test_case_id',
      as: 'rules',
      through: 'test_case_axe_rules'
    });
    TestCase.belongsToMany(models.systemStandardCriteria, {
      foreignKey: 'test_case_id',
      as: 'criteria',
      through: 'test_case_criteria'
    });
  };

  return TestCase;
};
