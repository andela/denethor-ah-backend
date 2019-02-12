module.exports = (sequelize, DataTypes) => {
  const CommentHistory = sequelize.define('CommentHistory', {
    commentId: DataTypes.UUID,
    commentBody: DataTypes.TEXT
  }, {
    updatedAt: false
  });
  return CommentHistory;
};
