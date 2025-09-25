export default (sequelize, DataTypes) => {
  const Profile = sequelize.define('profile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING
    }
  });

  Profile.associate = (models) => {
    Profile.hasOne(models.profileOrganization, {
      foreignKey: 'profile_id',
      as: 'organization',
      onDelete: 'CASCADE'
    });
  };

  return Profile;
};
