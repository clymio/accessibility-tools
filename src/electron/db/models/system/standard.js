export default (sequelize, DataTypes) => {
  const SystemStandard = sequelize.define('systemStandard', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  SystemStandard.associate = (models) => {
    SystemStandard.hasMany(models.systemStandardVersion, {
      foreignKey: 'system_standard_id',
      as: 'versions'
    });
    SystemStandard.hasMany(models.systemStandardPrinciple, {
      foreignKey: 'system_standard_id',
      as: 'principles'
    });
    SystemStandard.hasMany(models.systemStandardGuideline, {
      foreignKey: 'system_standard_id',
      as: 'guidelines'
    });
    SystemStandard.hasMany(models.systemStandardCriteria, {
      foreignKey: 'system_standard_id',
      as: 'criteria'
    });
  };

  return SystemStandard;
};
