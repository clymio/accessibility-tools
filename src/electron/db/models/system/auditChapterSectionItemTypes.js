export default (sequelize, DataTypes) => {
  const SystemAuditChapterSectionItemType = sequelize.define('systemAuditChapterSectionItemType', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  });

  SystemAuditChapterSectionItemType.associate = (models) => {
    SystemAuditChapterSectionItemType.belongsToMany(models.systemAuditChapterSectionItem, {
      foreignKey: 'system_audit_chapter_section_item_type_id',
      as: 'items',
      through: 'system_audit_item_types'
    });
    SystemAuditChapterSectionItemType.hasMany(models.auditItem, {
      foreignKey: 'system_audit_chapter_section_item_type_id',
      as: 'audit_section_type_items'
    });
  };

  return SystemAuditChapterSectionItemType;
};
