export const ENVIRONMENT_TEST_PAGE_TYPE_VALUES = ['RANDOM', 'STRUCTURED'];

export default (sequelize, DataTypes) => {
  const EnvironmentTestPage = sequelize.define('environmentTestPage', {
    page_type: {
      type: DataTypes.ENUM,
      values: ENVIRONMENT_TEST_PAGE_TYPE_VALUES,
      defaultValue: ENVIRONMENT_TEST_PAGE_TYPE_VALUES[0]
    },
    start_date: {
      type: DataTypes.DATE
    },
    end_date: {
      type: DataTypes.DATE
    }
  });

  EnvironmentTestPage.associate = (models) => {};

  return EnvironmentTestPage;
};
