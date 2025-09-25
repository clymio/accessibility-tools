export default (sequelize, DataTypes) => {
  const SystemAuditChapterSection = sequelize.define('systemAuditChapterSection', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    table_name: {
      type: DataTypes.STRING
    },
    url: {
      type: DataTypes.STRING
    }
  });

  SystemAuditChapterSection.associate = (models) => {
    SystemAuditChapterSection.hasMany(models.systemAuditChapterSectionItem, {
      foreignKey: 'system_audit_chapter_section_id',
      as: 'items'
    });
    SystemAuditChapterSection.belongsTo(models.systemAuditChapter, {
      foreignKey: 'system_audit_chapter_id',
      as: 'chapter'
    });
    SystemAuditChapterSection.belongsToMany(models.audit, {
      through: 'system_audit_chapter_item_audit',
      foreignKey: 'system_audit_chapter_item_id',
      as: 'audits'
    });
  };

  return SystemAuditChapterSection;
};
