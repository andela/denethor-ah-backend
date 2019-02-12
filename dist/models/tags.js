"use strict";

module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    tagText: DataTypes.TEXT
  }, {
    timestamps: false
  });

  Tag.associate = models => {
    Tag.belongsToMany(models.Article, {
      foreignKey: 'tagId',
      otherKey: 'articleId',
      through: 'TagArticle',
      timestamps: false,
      as: 'articles',
      onDelete: 'CASCADE'
    });
  };

  return Tag;
};