module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TagArticle', {
    tagId: {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'Tag',
        key: 'id',
      },
    },
    articleId: {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'Article',
        key: 'id'
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('TagArticle')
};
