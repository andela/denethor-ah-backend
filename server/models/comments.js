module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    commentBody: {
      allowNull: false,
      type: DataTypes.TEXT
    },
  });
  Comment.associate = (models) => {
    Comment.hasMany(models.CommentHistory, {
      foreignKey: 'commentId',
      as: 'commentHistories'
    });
    Comment.hasMany(models.LikeComment, {
      foreignKey: 'commentId',
      as: 'commentLikes'
    });
  };
  return Comment;
};
