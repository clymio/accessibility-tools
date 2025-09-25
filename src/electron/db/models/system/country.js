export default (sequelize, DataTypes) => {
  const SystemCountry = sequelize.define('systemCountry', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_prefix: {
      type: DataTypes.STRING
    },
    short_name: {
      type: DataTypes.STRING
    }
  });

  SystemCountry.associate = (models) => {
    SystemCountry.belongsTo(models.systemContinent, {
      foreignKey: 'continent_id',
      as: 'continent'
    });
    SystemCountry.hasMany(models.systemState, {
      foreignKey: 'country_id',
      as: 'states'
    });
  };

  return SystemCountry;
};
