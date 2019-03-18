module.exports = (sequelize, DataTypes) => {
  const LikeDislike = sequelize.define('LikeDislike', {
    likeImpression: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
    dislikeImpression: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
  });

  LikeDislike.associate = (models) => {
    LikeDislike.belongsTo(models.Article, {
      foreignKey: 'articleId'
    });
  };
  return LikeDislike;
};
