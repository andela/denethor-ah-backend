module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TagArticle', {
    tagId: {
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()'),
      onDelete: 'CASCADE',
      references: {
        model: 'Tag',
        key: 'id',
        as: 'tagId',
      },
    },
    articleId: {
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()'),
      onDelete: 'CASCADE',
      references: {
        model: 'Article',
        key: 'id',
        as: 'articleId',
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('TagArticle')
};
