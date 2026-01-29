export default {
  up: async (queryInterface, Sequelize) => {
    const TestCaseEnvironmentTestPageTarget = queryInterface.sequelize.models.testCaseEnvironmentTestPageTarget;
    const tableName = TestCaseEnvironmentTestPageTarget.getTableName();
    return queryInterface.sequelize.transaction(async (t) => {
      await Promise.all([
        // add system_landmark_id foreign key column
        queryInterface.addColumn(tableName, 'system_landmark_id', {
          type: Sequelize.STRING,
          allowNull: true,
          references: {
            model: queryInterface.sequelize.models.systemLandmark.getTableName(),
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        }, {
          transaction: t
        }),
        // add parent_landmark_id column
        queryInterface.addColumn(tableName, 'parent_landmark_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: tableName,
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        }, {
          transaction: t
        })
      ]);
      await queryInterface.addIndex(tableName, ['system_landmark_id'], {
        transaction: t
      });
      await queryInterface.addIndex(tableName, ['parent_landmark_id'], {
        transaction: t
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    const TestCaseEnvironmentTestPageTarget = queryInterface.sequelize.models.testCaseEnvironmentTestPageTarget;
    const tableName = TestCaseEnvironmentTestPageTarget.getTableName();
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        // remove system_landmark_id column
        queryInterface.removeColumn(tableName, 'system_landmark_id', {
          transaction: t
        }),
        // remove parent_landmark_id column
        queryInterface.removeColumn(tableName, 'parent_landmark_id', {
          transaction: t
        })
      ]);
    });
  }
};
