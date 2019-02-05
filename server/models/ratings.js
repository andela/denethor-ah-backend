module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    Rating: DataTypes.INTEGER
  });
  return Rating;
};
