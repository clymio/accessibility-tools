export default (sequelize, DataTypes) => {
  const Settings = sequelize.define('settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    data_directory_path: {
      type: DataTypes.STRING
    },
    can_open_browser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_eula_accepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Settings.associate = (models) => {};

  return Settings;
};
