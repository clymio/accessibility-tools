export default {
  up: async (queryInterface, Sequelize) => {
    const TestCaseEnvironmentTestPageTarget = queryInterface.sequelize.models.testCaseEnvironmentTestPageTarget;
    const tableName = TestCaseEnvironmentTestPageTarget.getTableName();
    return queryInterface.sequelize.transaction(async (t) => {
      await Promise.all([
        // add relatedTargetCount column
        queryInterface.addColumn(tableName, 'related_target_count', {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }, {
          transaction: t
        }),
        // add relatedRemediationCount column
        queryInterface.addColumn(tableName, 'related_remediation_count', {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }, {
          transaction: t
        })
      ]);
      await queryInterface.addIndex(tableName, ['related_target_count'], {
        transaction: t
      });
      await queryInterface.addIndex(tableName, ['related_remediation_count'], {
        transaction: t
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    const TestCaseEnvironmentTestPageTarget = queryInterface.sequelize.models.testCaseEnvironmentTestPageTarget;
    const tableName = TestCaseEnvironmentTestPageTarget.getTableName();
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        // remove relatedTargetCount column
        queryInterface.removeColumn(tableName, 'related_target_count', {
          transaction: t
        }),
        // remove relatedRemediationCount column
        queryInterface.removeColumn(tableName, 'related_remediation_count', {
          transaction: t
        })
      ]);
    });
  }
};
