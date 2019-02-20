module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    slug: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    body: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    title: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    authorId: {
      allowNull: false,
      type: DataTypes.UUID,
    },
    references: DataTypes.ARRAY(DataTypes.STRING),
    categoryId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
  });
  Article.associate = (models) => {
    Article.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author'
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
    Article.belongsToMany(models.Tag, {
      foreignKey: 'articleId',
      otherKey: 'tagId',
      through: 'TagArticle',
      timestamps: false,
      as: 'tags',
    });
  };
  return Article;
};
