export const TEST_CASE_PAGE_STATUS_VALUES = ['PASS', 'FAIL', 'ERROR', 'NOT_APPLICABLE', 'INCOMPLETE', 'IN_PROGRESS', 'MANUAL'];

export default (sequelize, DataTypes) => {
  const TestCaseEnvironmentTestPageTarget = sequelize.define(
    'testCaseEnvironmentTestPageTarget',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      status: {
        type: DataTypes.ENUM,
        values: TEST_CASE_PAGE_STATUS_VALUES
      },
      rule: {
        type: DataTypes.TEXT
      },
      selector: {
        type: DataTypes.TEXT
      },
      html: {
        type: DataTypes.TEXT
      },
      summary: {
        type: DataTypes.TEXT
      },
      notes: {
        type: DataTypes.TEXT
      },
      selector_used: {
        type: DataTypes.STRING,
        allowNull: true
      },
      test_case_page_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      remediation_id: {
        type: DataTypes.STRING
      }
    },
    {
      indexes: [
        {
          fields: ['test_case_page_id']
        },
        {
          fields: ['remediation_id']
        }
      ]
    }
  );

  TestCaseEnvironmentTestPageTarget.associate = (models) => {
    TestCaseEnvironmentTestPageTarget.belongsTo(models.testCaseEnvironmentTestPage, {
      foreignKey: 'test_case_page_id',
      as: 'test'
    });
    TestCaseEnvironmentTestPageTarget.belongsTo(models.remediation, {
      foreignKey: 'remediation_id',
      as: 'remediation'
    });
  };

  return TestCaseEnvironmentTestPageTarget;
};
