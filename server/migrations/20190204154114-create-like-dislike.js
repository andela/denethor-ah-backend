module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('LikeDislike', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()')
    },
    userId: {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'User',
        key: 'id',
        as: 'userId',
      },
    },
    articleId: {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'Article',
        key: 'id',
        as: 'articleId',
      },
    },
    likeImpression: {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN
    },
    dislikeImpression: {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN
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
  down: queryInterface => queryInterface.dropTable('LikeDislike')
};
