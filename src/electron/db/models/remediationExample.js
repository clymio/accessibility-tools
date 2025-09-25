export default (sequelize, DataTypes) => {
  const RemediationExample = sequelize.define('remediationExample', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    code: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  RemediationExample.associate = (models) => {
    RemediationExample.belongsTo(models.remediation, {
      foreignKey: 'remediation_id',
      as: 'remediation'
    });
  };

  return RemediationExample;
};
