export default (sequelize, DataTypes) => {
  const SystemState = sequelize.define('systemState', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  SystemState.associate = (models) => {
    SystemState.belongsTo(models.systemCountry, {
      foreignKey: 'country_id',
      as: 'country'
    });
  };

  return SystemState;
};
