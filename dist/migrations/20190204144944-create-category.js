"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Category', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER
    },
    categoryName: {
      allowNull: false,
      type: Sequelize.TEXT
    }
  }),
  down: queryInterface => queryInterface.dropTable('Category')
};