export default (sequelize, DataTypes) => {
  const Remediation = sequelize.define('remediation', {
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
    },
    selectors: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: ['body']
    },
    is_selected: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Remediation.associate = (models) => {
    Remediation.belongsTo(models.systemCategory, {
      foreignKey: 'system_category_id',
      as: 'category'
    });
    Remediation.hasMany(models.remediationExample, {
      foreignKey: 'remediation_id',
      as: 'examples'
    });
    Remediation.belongsToMany(models.testCase, {
      foreignKey: 'remediation_id',
      as: 'test_cases',
      through: 'test_case_remediations'
    });
    Remediation.belongsToMany(models.systemStandardCriteria, {
      foreignKey: 'remediation_id',
      as: 'criteria',
      through: 'remediation_criteria'
    });
  };

  return Remediation;
};
