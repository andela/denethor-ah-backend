import bcrypt from 'bcrypt';

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
      defaultValue: 'author',
    },
    bio: DataTypes.TEXT,
    imageUrl: DataTypes.STRING,
    isVerified: {
      defaultValue: false,
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
  });

  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSaltSync();
    user.password = await bcrypt.hashSync(user.password, salt);
  });
  User.associate = (models) => {
    User.hasMany(models.Article, {
      foreignKey: 'userId',
      as: 'userArticles',
    });
    User.belongsToMany(models.User, {
      foreignKey: 'userId',
      otherKey: 'followerId',
      through: 'UserFollower',
      as: 'followers',
      timestamps: false,
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
