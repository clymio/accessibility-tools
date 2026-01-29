export default (sequelize, DataTypes) => {
  const SystemLandmark = sequelize.define('systemLandmark', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    selectors: {
      type: DataTypes.JSON,
      allowNull: false
    }
  });

  SystemLandmark.associate = (models) => {

  };

  return SystemLandmark;
};
