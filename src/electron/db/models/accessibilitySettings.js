import { PROFILES } from '@/constants/accessibility';

export default (sequelize, DataTypes) => {
  const AccessibilitySettings = sequelize.define('accessibilitySettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    profile: {
      type: DataTypes.ENUM,
      values: Object.values(PROFILES),
      allowNull: true
    },
    adjustments: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: true
    }
  });

  AccessibilitySettings.associate = (models) => {
  };

  return AccessibilitySettings;
};
