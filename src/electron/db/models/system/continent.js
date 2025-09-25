export default (sequelize, DataTypes) => {
  const SystemContinent = sequelize.define('systemContinent', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  SystemContinent.associate = (models) => {
    SystemContinent.hasMany(models.systemCountry, {
      foreignKey: 'continent_id',
      as: 'countries'
    });
  };

  return SystemContinent;
};
