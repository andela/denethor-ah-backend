module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    commentBody: {
      allowNull: false,
      type: DataTypes.TEXT
    },
  });
  return Comment;
};
