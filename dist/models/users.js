"use strict";

var _bcrypt = _interopRequireDefault(require("bcrypt"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstname: {
      allowNull: false,
      type: DataTypes.STRING
    },
    lastname: {
      allowNull: true,
      type: DataTypes.STRING
    },
    username: {
      allowNull: false,
      type: DataTypes.STRING
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING
    },
    role: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: 'author'
    },
    bio: DataTypes.TEXT,
    imageUrl: DataTypes.STRING,
    isVerified: {
      defaultValue: false,
      allowNull: false,
      type: DataTypes.BOOLEAN
    }
  });
  User.beforeCreate(async user => {
    const salt = await _bcrypt.default.genSaltSync();
    user.password = await _bcrypt.default.hashSync(user.password, salt);
  });

  User.associate = models => {
    User.hasMany(models.Article, {
      foreignKey: 'authorId',
      as: 'userArticles'
    });
    User.belongsToMany(models.User, {
      foreignKey: 'userId',
      otherKey: 'followerId',
      through: 'UserFollower',
      as: 'followers',
      timestamps: false
    });
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      as: 'userNotifications'
    });
    User.hasMany(models.Bookmark, {
      foreignKey: 'userId',
      as: 'userBookmarks'
    });
    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'userComments'
    });
    User.hasMany(models.LikeDislike, {
      foreignKey: 'userId'
    });
    User.hasMany(models.Rating, {
      foreignKey: 'userId'
    });
  };

  User.passwordMatch = (encodedPassword, password) => _bcrypt.default.compareSync(password, encodedPassword);

  return User;
};