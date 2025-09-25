export default (sequelize, DataTypes) => {
  const SystemAuditTypeVersion = sequelize.define('systemAuditTypeVersion', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  SystemAuditTypeVersion.associate = (models) => {
    SystemAuditTypeVersion.hasOne(models.audit, {
      foreignKey: 'system_audit_type_version_id',
      as: 'audit'
    });
    SystemAuditTypeVersion.belongsTo(models.systemAuditType, {
      foreignKey: 'system_audit_type_id',
      as: 'type'
    });
  };

  return SystemAuditTypeVersion;
};
