import { AUDIT_ITEM_LEVEL_VALUES } from '@/constants/audit';

export default (sequelize, DataTypes) => {
  const AuditItem = sequelize.define('auditItem', {
    level: {
      type: DataTypes.ENUM,
      values: AUDIT_ITEM_LEVEL_VALUES
    },
    remarks: {
      type: DataTypes.TEXT
    },
    audit_id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    system_audit_chapter_section_item_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    system_audit_chapter_section_item_type_id: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    uniqueKeys: {},
    indexes: []
  });

  AuditItem.associate = (models) => {
    AuditItem.belongsTo(models.audit, {
      foreignKey: 'audit_id',
      as: 'audit'
    });
    AuditItem.belongsTo(models.systemAuditChapterSectionItem, {
      foreignKey: 'system_audit_chapter_section_item_id',
      as: 'item'
    });
    AuditItem.belongsTo(models.systemAuditChapterSectionItemType, {
      foreignKey: 'system_audit_chapter_section_item_type_id',
      as: 'type'
    });
  };

  return AuditItem;
};
