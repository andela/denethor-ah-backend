import bcrypt from 'bcrypt';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    bio: DataTypes.TEXT,
    imageUrl: DataTypes.STRING,
    isVerified: DataTypes.BOOLEAN
  });

  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt();
    return bcrypt.hashSync(user.password, salt);
  });
  User.associate = (models) => {
    User.hasMany(models.Article, {
      foreignKey: 'userId',
      as: 'userArticles',
    });
    User.belongsToMany(models.User, {
      foreignKey: 'userId',
      through: 'UserFollower',
      as: 'followers',
    });
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      as: 'userNotifications',
    });
    User.hasMany(models.Bookmark, {
      foreignKey: 'userId',
      as: 'userBookmarks',
    });
    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'userComments',
    });
    User.hasMany(models.LikeDislike, {
      foreignKey: 'userId'
    });
  };
  User.passwordMatch = (encodedPassword, password) => bcrypt.compareSync(password, encodedPassword);
  return User;
};
