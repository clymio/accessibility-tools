export default (sequelize, DataTypes) => {
  const SystemStandardGuideline = sequelize.define('systemStandardGuideline', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  SystemStandardGuideline.associate = (models) => {
    SystemStandardGuideline.belongsTo(models.systemStandard, {
      foreignKey: 'system_standard_id',
      as: 'standard'
    });
    SystemStandardGuideline.belongsTo(models.systemStandardPrinciple, {
      foreignKey: 'system_standard_principle_id',
      as: 'principle'
    });
    SystemStandardGuideline.belongsToMany(models.systemStandardVersion, {
      foreignKey: 'system_standard_guideline_id',
      as: 'versions',
      through: 'system_version_guideline'
    });
    SystemStandardGuideline.hasMany(models.systemStandardCriteria, {
      foreignKey: 'system_standard_guideline_id',
      as: 'criteria'
    });
  };

  return SystemStandardGuideline;
};
