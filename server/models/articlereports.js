module.exports = (sequelize, DataTypes) => {
  const ArticleReports = sequelize.define('ArticleReports', {
    articleId: DataTypes.STRING,
    userId: DataTypes.STRING
  }, {});

  return ArticleReports;
};
