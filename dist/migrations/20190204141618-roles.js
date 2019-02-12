"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Roles', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER
    },
    name: {
      allowNull: false,
      type: Sequelize.TEXT,
      unique: true
    }
  }),
  down: queryInterface => queryInterface.dropTable('Roles')
};