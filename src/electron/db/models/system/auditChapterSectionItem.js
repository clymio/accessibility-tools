export default (sequelize, DataTypes) => {
  const SystemAuditChapterSectionItem = sequelize.define('systemAuditChapterSectionItem', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.STRING
    }
  });

  SystemAuditChapterSectionItem.associate = (models) => {
    SystemAuditChapterSectionItem.belongsTo(models.systemAuditChapterSection, {
      foreignKey: 'system_audit_chapter_section_id',
      as: 'section'
    });
    SystemAuditChapterSectionItem.belongsTo(models.systemStandardCriteria, {
      foreignKey: 'system_standard_criteria_id',
      as: 'criteria'
    });
    SystemAuditChapterSectionItem.hasMany(models.auditItem, {
      foreignKey: 'system_audit_chapter_section_item_id',
      as: 'audit_section_items'
    });
    SystemAuditChapterSectionItem.belongsToMany(models.systemAuditChapterSectionItemType, {
      foreignKey: 'system_audit_chapter_section_item_id',
      as: 'types',
      through: 'system_audit_item_types'
    });
  };

  return SystemAuditChapterSectionItem;
};
