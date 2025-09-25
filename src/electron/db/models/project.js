export default (sequelize, DataTypes) => {
  const Project = sequelize.define('project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING
    },
    connected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    essential_functionality: {
      type: DataTypes.TEXT
    },
    webpage_types: {
      type: DataTypes.TEXT
    }
  });

  Project.associate = (models) => {
    Project.hasMany(models.environment, {
      as: 'environments',
      foreignKey: 'project_id'
    });
    Project.belongsToMany(models.technology, {
      as: 'technologies',
      foreignKey: 'project_id',
      through: 'project_technology'
    });
  };

  return Project;
};
