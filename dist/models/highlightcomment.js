"use strict";

module.exports = (sequelize, DataTypes) => {
  const HighlightComment = sequelize.define('HighlightComment', {
    highlight: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    comment: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    articleId: DataTypes.UUID,
    readerId: DataTypes.UUID
  });
  return HighlightComment;
};