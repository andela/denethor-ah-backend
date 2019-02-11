module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    name: {
      allowNull: false,
      type: DataTypes.TEXT
    },
  },
  {
    timestamps: false
  });
  Roles.associate = (models) => {
    Roles.hasMany(models.User, {
      foreignKey: 'role'
    });
  };
  return Roles;
};
