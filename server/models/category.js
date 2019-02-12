module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    categoryName: {
      allowNull: false,
      type: DataTypes.TEXT
    },
  },
  {
    timestamps: false
  });
  Category.associate = (models) => {
    Category.hasMany(models.Article, {
      foreignKey: 'categoryId',
      as: 'articles'
    });
  };
  return Category;
};
