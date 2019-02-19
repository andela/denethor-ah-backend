module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Shares', {
      articleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      shareType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shareCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
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
  down: (queryInterface) => {
    return queryInterface.dropTable('Shares');
  }
};
