export default (sequelize, DataTypes) => {
  const Technology = sequelize.define('technology', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Technology.associate = (models) => {
    Technology.belongsToMany(models.project, {
      foreignKey: 'technology_id',
      as: 'projects',
      through: 'project_technology'
    });
  };

  return Technology;
};
