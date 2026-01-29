export default (sequelize, DataTypes) => {
  const TestPageTargetOccurrence = sequelize.define(
    'testPageTargetOccurrence',
    {
      page_target_id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      related_page_target_id: {
        type: DataTypes.UUID,
        primaryKey: true
      }
    },
    {
      timestamps: false,
      indexes: [
        {
          fields: ['page_target_id']
        },
        {
          fields: ['related_page_target_id']
        }
      ]
    }
  );

  TestPageTargetOccurrence.associate = (models) => {
    TestPageTargetOccurrence.belongsTo(models.testCaseEnvironmentTestPageTarget, {
      foreignKey: 'page_target_id',
      as: 'page_target'
    });
    TestPageTargetOccurrence.belongsTo(models.testCaseEnvironmentTestPageTarget, {
      foreignKey: 'related_page_target_id',
      as: 'related_page_target'
    });
  };

  return TestPageTargetOccurrence;
};
