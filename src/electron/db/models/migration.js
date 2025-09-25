export default (sequelize, DataTypes) => {
  const Migration = sequelize.define('migration', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    applied_at: {
      type: DataTypes.DATE
    }
  });

  return Migration;
};
