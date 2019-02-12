"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UserFollower', {
    userId: {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'User',
        key: 'id',
        as: 'userId'
      }
    },
    followerId: {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'User',
        key: 'id',
        as: 'followerId'
      }
    }
  }),
  down: queryInterface => queryInterface.dropTable('UserFollower')
};