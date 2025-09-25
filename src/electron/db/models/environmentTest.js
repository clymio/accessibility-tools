export const ENVIRONMENT_TEST_CASE_STATUS_VALUES = ['OPENED', 'IN_PROGRESS', 'TEST_COMPLETED', 'TEST_FAILED', 'COMPLETED', 'FAILED', 'CLOSED'];

export default (sequelize, DataTypes) => {
  const EnvironmentTest = sequelize.define('environmentTest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    functionality_note: {
      type: DataTypes.TEXT
    },
    page_variety_note: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM,
      values: ENVIRONMENT_TEST_CASE_STATUS_VALUES,
      defaultValue: ENVIRONMENT_TEST_CASE_STATUS_VALUES[0]
    },
    start_date: {
      type: DataTypes.DATE
    },
    end_date: {
      type: DataTypes.DATE
    }
  });

  EnvironmentTest.prototype.destroyAssociations = async function (options) {
    const models = sequelize.models;
    return await sequelize.transaction(async (t) => {
      await Promise.all([
        models.environmentTestPage.destroy({ where: { environment_test_id: this.id }, transaction: t }),
        models.testCaseEnvironmentTestPage.destroy({ where: { environment_test_id: this.id }, hooks: false, cascade: true, transaction: t })
      ]);
    });
  };

  EnvironmentTest.beforeDestroy(async (environmentTest, options) => {
    await environmentTest.destroyAssociations(options);
  });

  EnvironmentTest.associate = (models) => {
    EnvironmentTest.belongsTo(models.environment, {
      foreignKey: 'environment_id',
      as: 'environment'
    });
    EnvironmentTest.hasMany(models.testCaseEnvironmentTestPage, { foreignKey: 'environment_test_id', as: 'test_cases' });
    EnvironmentTest.belongsToMany(models.environmentPage, {
      foreignKey: 'environment_test_id',
      as: 'random_pages',
      through: { model: 'environmentTestPage', scope: { page_type: 'RANDOM' } }
    });
    EnvironmentTest.belongsToMany(models.environmentPage, {
      foreignKey: 'environment_test_id',
      as: 'structured_pages',
      through: { model: 'environmentTestPage', scope: { page_type: 'STRUCTURED' } }
    });
  };

  return EnvironmentTest;
};
