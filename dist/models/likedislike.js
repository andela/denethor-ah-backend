"use strict";

module.exports = (sequelize, DataTypes) => {
  const LikeDislike = sequelize.define('LikeDislike', {
    like: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
    dislike: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN
    }
  });

  LikeDislike.associate = models => {
    LikeDislike.belongsTo(models.Article, {
      foreignKey: 'articleId'
    });
  };

  return LikeDislike;
};