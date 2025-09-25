export default (sequelize, DataTypes) => {
  const AxeRules = sequelize.define('systemAxeRules', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    help: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    helpUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  AxeRules.associate = (models) => {
    AxeRules.belongsToMany(models.testCase, {
      foreignKey: 'axe_rule_id',
      as: 'test_cases',
      through: 'test_case_axe_rules'
    });
  };

  return AxeRules;
};
