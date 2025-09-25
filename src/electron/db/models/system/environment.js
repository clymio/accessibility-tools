export default (sequelize, DataTypes) => {
  const SystemEnvironment = sequelize.define('systemEnvironment', {
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
    }
  });

  SystemEnvironment.associate = (models) => {

  };

  return SystemEnvironment;
};
