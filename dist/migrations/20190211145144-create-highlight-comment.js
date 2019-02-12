"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('HighlightComment', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    readerId: {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'User',
        key: 'id',
        as: 'readerId'
      }
    },
    articleId: {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'Article',
        key: 'id',
        as: 'articleId'
      }
    },
    highlight: {
      type: Sequelize.TEXT
    },
    comment: {
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
  down: queryInterface => queryInterface.dropTable('HighlightComment')
};