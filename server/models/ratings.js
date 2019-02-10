module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    ratings: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER
    },
    userId: DataTypes.UUID,
    articleId: DataTypes.UUID,
    createdAt: DataTypes.DATE,
  }, {
    updatedAt: false
  });
  return Rating;
};
