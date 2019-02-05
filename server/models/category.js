module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    categoryName: DataTypes.TEXT
  });
  Category.associate = (models) => {
    Category.hasMany(models.Article, {
      foreignKey: 'categoryId'
    });
  };
  return Category;
};
