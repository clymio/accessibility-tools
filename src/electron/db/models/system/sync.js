export default (sequelize, DataTypes) => {
  const SystemSync = sequelize.define(
    'systemSync',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      version: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true,
      updatedAt: 'last_sync_at'
    }
  );

  SystemSync.associate = () => {};

  return SystemSync;
};
