

module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    bookmarkTitle: DataTypes.STRING,
    articleUrl: DataTypes.TEXT,
    userId: DataTypes.UUID
  });
  return Bookmark;
};
