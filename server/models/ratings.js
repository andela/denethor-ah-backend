module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    Rating: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER
    },
  });
  return Rating;
};
