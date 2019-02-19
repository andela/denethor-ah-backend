module.exports = (sequelize, DataTypes) => {
  const LikeComment = sequelize.define('LikeComment', {
    userId: DataTypes.UUID,
    commentId: DataTypes.UUID
  });
  LikeComment.associate = function (models) {
    LikeComment.belongsTo(models.Comment, {
      foreignKey: 'commentId'
    });
  };
  return LikeComment;
};
