module.exports = (sequelize, DataTypes) => {
  const Shares = sequelize.define('Shares', {
    articleId: DataTypes.UUID,
    shareType: DataTypes.STRING,
    shareCount: DataTypes.INTEGER
  }, {
  });
  Shares.removeAttribute('id');
  return Shares;
};
