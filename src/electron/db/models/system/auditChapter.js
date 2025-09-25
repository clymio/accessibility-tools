export default (sequelize, DataTypes) => {
  const SystemAuditChapter = sequelize.define('systemAuditChapter', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  SystemAuditChapter.associate = (models) => {
    SystemAuditChapter.hasMany(models.systemAuditChapterSection, {
      foreignKey: 'system_audit_chapter_id',
      as: 'sections'
    });
    SystemAuditChapter.hasMany(models.systemAuditChapterAuditTypeVersion, {
      foreignKey: 'system_audit_chapter_id',
      as: 'audit_type_versions'
    });
  };

  return SystemAuditChapter;
};
