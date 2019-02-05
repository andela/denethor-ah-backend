module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Notification', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()')
    },
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
    notificationBody: {
      allowNull: {
        args: false,
        msg: 'What is the notification about?'
      },
      type: Sequelize.TEXT
    },
    seen: {
      allowNull: false,
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
  down: queryInterface => queryInterface.dropTable('Notification')
};
