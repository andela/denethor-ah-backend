module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('LikeComment', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'User',
          key: 'id',
          as: 'userId',
        }
      },
      commentId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Comment',
          key: 'id',
          as: 'commentId',
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface) => { return queryInterface.dropTable('LikeComment'); }
};
