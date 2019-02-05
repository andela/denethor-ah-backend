module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    slug: DataTypes.TEXT,
    body: DataTypes.TEXT,
    description: DataTypes.TEXT,
    authorId: DataTypes.UUID,
    references: DataTypes.ARRAY(DataTypes.STRING),
    CategoryId: DataTypes.INTEGER
  }, {});
  Article.associate = (models) => {
    Article.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    Article.hasMany(models.Comment, {
      foreignKey: 'articleId',
      as: 'comments',
    });
    Article.hasMany(models.LikeDislike, {
      foreignKey: 'articleId',
      as: 'LikeDislikes',
    });
    Article.hasMany(models.Rating, {
      foreignKey: 'articleId',
      as: 'articleRatings',
    });
    Article.hasMany(models.Bookmark, {
      foreignKey: 'articleId',
      as: 'articleBookmarks',
    });
    Article.belongsToMany(models.Tag, {
      foreignKey: 'articleId',
      through: 'TagArticle',
      as: 'ArticleTag',
      onDelete: 'CASCADE'
    });
  };
  return Article;
};
