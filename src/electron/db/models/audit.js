export const CONFORMANCE_TARGETS = ['A', 'AA', 'AAA'];
export const AUDIT_STATUS = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

export default (sequelize, DataTypes) => {
  const Audit = sequelize.define('audit', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    status: {
      type: DataTypes.ENUM,
      values: AUDIT_STATUS,
      defaultValue: AUDIT_STATUS[0]
    },
    wcag_version: {
      type: DataTypes.STRING,
      allowNull: false
    },
    conformance_target: {
      type: DataTypes.ENUM,
      values: CONFORMANCE_TARGETS,
      allowNull: false
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    product_version: {
      type: DataTypes.STRING,
      allowNull: true
    },
    product_description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    product_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendor_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vendor_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendor_contact_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendor_contact_email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendor_contact_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    methods: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    disclaimer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    repository_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    license: {
      type: DataTypes.STRING,
      allowNull: true
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  Audit.associate = (models) => {
    Audit.belongsTo(models.project, {
      foreignKey: 'project_id',
      as: 'project'
    });
    Audit.belongsTo(models.environment, {
      foreignKey: 'environment_id',
      as: 'environment'
    });
    Audit.belongsTo(models.environmentTest, {
      foreignKey: 'environment_test_id',
      as: 'test'
    });
    Audit.belongsTo(models.profile, {
      foreignKey: 'profile_id',
      as: 'profile'
    });
    Audit.belongsTo(models.systemAuditType, {
      foreignKey: 'system_audit_type_id',
      as: 'type'
    });
    Audit.belongsTo(models.systemAuditTypeVersion, {
      foreignKey: 'system_audit_type_version_id',
      as: 'version'
    });
    Audit.belongsToMany(models.systemAuditChapterSection, {
      through: 'audit_chapter_section_audit',
      foreignKey: 'audit_id',
      as: 'chapters'
    });
    Audit.hasMany(models.auditItem, {
      foreignKey: 'audit_id',
      as: 'items'
    });
  };

  return Audit;
};
