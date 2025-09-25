export default (sequelize, DataTypes) => {
  const SystemCategory = sequelize.define('systemCategory', {
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
    },
    is_selected: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  SystemCategory.associate = (models) => {
    SystemCategory.hasMany(models.remediation, {
      foreignKey: 'system_category_id',
      as: 'remediations'
    });
  };

  return SystemCategory;
};
