export default (sequelize, DataTypes) => {
  const Environment = sequelize.define('environment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Environment.associate = (models) => {
    Environment.belongsTo(models.project, {
      foreignKey: 'project_id',
      as: 'project'
    });
    Environment.hasMany(models.environmentTest, {
      foreignKey: 'environment_id',
      as: 'tests'
    });
  };

  return Environment;
};
