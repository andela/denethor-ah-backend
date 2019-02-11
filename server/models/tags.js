module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    tagText: DataTypes.TEXT,
  });
  return Tag;
};
