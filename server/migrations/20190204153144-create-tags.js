

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Tag', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()')
    },
    tagText: {
      allowNull: false,
      type: Sequelize.TEXT
    }
  }),
  down: queryInterface => queryInterface.dropTable('Tag')
};
