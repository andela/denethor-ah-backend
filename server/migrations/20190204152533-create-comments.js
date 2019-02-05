

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Comment', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()'),
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
    commentBody: {
      allowNull: {
        args: false,
        msg: 'Please write your comment?'
      },
      type: Sequelize.TEXT
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: queryInterface => queryInterface.dropTable('Comment')
};
