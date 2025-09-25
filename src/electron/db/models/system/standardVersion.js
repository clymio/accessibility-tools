export default (sequelize, DataTypes) => {
  const SystemStandardVersion = sequelize.define('systemStandardVersion', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  SystemStandardVersion.associate = (models) => {
    SystemStandardVersion.belongsTo(models.systemStandard, {
      foreignKey: 'system_standard_id',
      as: 'standard'
    });
    SystemStandardVersion.belongsToMany(models.systemStandardPrinciple, {
      foreignKey: 'system_standard_version_id',
      as: 'principles',
      through: 'system_version_principle'
    });
    SystemStandardVersion.belongsToMany(models.systemStandardGuideline, {
      foreignKey: 'system_standard_version_id',
      as: 'guidelines',
      through: 'system_version_guideline'
    });
    SystemStandardVersion.belongsToMany(models.systemStandardCriteria, {
      foreignKey: 'system_standard_version_id',
      as: 'criteria',
      through: 'system_version_criteria'
    });
  };

  return SystemStandardVersion;
};
