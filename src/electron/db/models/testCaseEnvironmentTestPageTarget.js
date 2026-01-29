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
      },
      related_target_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      related_remediation_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {
      indexes: [
        {
          fields: ['status']
        },
        {
          fields: ['test_case_page_id']
        },
        {
          fields: ['remediation_id']
        },
        {
          fields: ['related_target_count']
        },
        {
          fields: ['related_remediation_count']
        },
        {
          fields: ['system_landmark_id']
        },
        {
          fields: ['parent_landmark_id']
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
    TestCaseEnvironmentTestPageTarget.belongsTo(models.systemLandmark, {
      foreignKey: 'system_landmark_id',
      as: 'landmark'
    });
    TestCaseEnvironmentTestPageTarget.belongsTo(TestCaseEnvironmentTestPageTarget, {
      foreignKey: 'parent_landmark_id',
      as: 'parent_landmark',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    TestCaseEnvironmentTestPageTarget.hasMany(TestCaseEnvironmentTestPageTarget, {
      foreignKey: 'parent_landmark_id',
      as: 'landmark_children',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    TestCaseEnvironmentTestPageTarget.belongsToMany(TestCaseEnvironmentTestPageTarget, {
      foreignKey: 'page_target_id',
      otherKey: 'related_page_target_id',
      as: 'related_targets',
      through: 'testPageTargetOccurrence'
    });
  };

  return TestCaseEnvironmentTestPageTarget;
};
