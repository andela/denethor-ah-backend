module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    commentBody: DataTypes.TEXT,
  });
  return Comment;
};
