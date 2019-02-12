"use strict";

module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    articleId: DataTypes.UUID,
    userId: DataTypes.UUID
  });
  return Bookmark;
};