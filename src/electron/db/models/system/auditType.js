export default (sequelize, DataTypes) => {
  const SystemAuditType = sequelize.define('systemAuditType', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  SystemAuditType.associate = (models) => {
    SystemAuditType.hasOne(models.audit, {
      foreignKey: 'system_audit_type_id',
      as: 'audit'
    });
    SystemAuditType.hasMany(models.systemAuditTypeVersion, {
      foreignKey: 'system_audit_type_id',
      as: 'versions'
    });
    SystemAuditType.hasMany(models.systemAuditChapterAuditTypeVersion, {
      foreignKey: 'system_audit_type_id',
      as: 'audit_type_chapters'
    });
  };

  return SystemAuditType;
};
