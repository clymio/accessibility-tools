export default (sequelize, DataTypes) => {
  const SystemStandardPrinciple = sequelize.define('systemStandardPrinciple', {
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

  SystemStandardPrinciple.associate = (models) => {
    SystemStandardPrinciple.belongsTo(models.systemStandard, {
      foreignKey: 'system_standard_id',
      as: 'standard'
    });
    SystemStandardPrinciple.belongsToMany(models.systemStandardVersion, {
      foreignKey: 'system_standard_principle_id',
      as: 'versions',
      through: 'system_version_principle'
    });
    SystemStandardPrinciple.hasMany(models.systemStandardGuideline, {
      foreignKey: 'system_standard_principle_id',
      as: 'guidelines'
    });
    SystemStandardPrinciple.hasMany(models.systemStandardCriteria, {
      foreignKey: 'system_standard_principle_id',
      as: 'criteria'
    });
  };

  return SystemStandardPrinciple;
};
