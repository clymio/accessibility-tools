export default (sequelize, DataTypes) => {
  const SystemAuditChapterAuditTypeVersion = sequelize.define('systemAuditChapterAuditTypeVersion', {
    system_audit_chapter_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    system_audit_type_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    system_audit_type_version_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: '' // loose reference to allow empty values
    }
  });

  SystemAuditChapterAuditTypeVersion.associate = (models) => {
    SystemAuditChapterAuditTypeVersion.belongsTo(models.systemAuditChapter, {
      foreignKey: 'system_audit_chapter_id',
      as: 'chapter'
    });
    SystemAuditChapterAuditTypeVersion.belongsTo(models.systemAuditType, {
      foreignKey: 'system_audit_type_id',
      as: 'type'
    });
  };

  return SystemAuditChapterAuditTypeVersion;
};
