export default (sequelize, DataTypes) => {
  const ProfileOrganization = sequelize.define('profileOrganization', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    logo: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    address_2: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING
    },
    zip_code: {
      type: DataTypes.STRING
    },
    url: {
      type: DataTypes.STRING
    }
  });

  ProfileOrganization.associate = (models) => {
    ProfileOrganization.belongsTo(models.profile, {
      foreignKey: 'profile_id',
      as: 'profile'
    });
    ProfileOrganization.belongsTo(models.systemCountry, {
      foreignKey: 'country_id',
      as: 'country'
    });
    ProfileOrganization.belongsTo(models.systemState, {
      foreignKey: 'state_id',
      as: 'state'
    });
  };

  return ProfileOrganization;
};
