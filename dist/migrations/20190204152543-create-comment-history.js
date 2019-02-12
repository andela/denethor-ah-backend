"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CommentHistory', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      commentId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Comment',
          key: 'id'
        }
      },
      commentBody: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: queryInterface => queryInterface.dropTable('CommentHistory')
};