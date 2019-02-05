module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UserFollower', {
    userId: {
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()'),
      onDelete: 'CASCADE',
      references: {
        model: 'User',
        key: 'id',
        as: 'userId',
      },
    },
    followerId: {
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()'),
      onDelete: 'CASCADE',
      references: {
        model: 'User',
        key: 'id',
        as: 'followerId',
      }
    }
  }),
  down: queryInterface => queryInterface.dropTable('UserFollower'),
};
