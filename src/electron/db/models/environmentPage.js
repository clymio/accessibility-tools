export default (sequelize, DataTypes) => {
  const EnvironmentPage = sequelize.define('environmentPage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    not_clickable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  EnvironmentPage.associate = (models) => {
    EnvironmentPage.belongsTo(models.environment, {
      foreignKey: 'environment_id',
      as: 'environment'
    });
    EnvironmentPage.belongsTo(EnvironmentPage, {
      foreignKey: 'parent_id',
      as: 'children'
    });
    EnvironmentPage.hasMany(models.testCaseEnvironmentTestPage, { foreignKey: 'environment_page_id', as: 'test_cases' });
    EnvironmentPage.belongsToMany(models.environmentTest, { foreignKey: 'environment_page_id', as: 'tests', through: 'environmentTestPage' });
  };

  return EnvironmentPage;
};
