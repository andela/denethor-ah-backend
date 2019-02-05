module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    tagText: DataTypes.TEXT
  });

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Article, {
      foreignKey: 'articleId',
      through: 'TagArticle',
      as: 'tagArticles',
    });
  };
  return Tag;
};
