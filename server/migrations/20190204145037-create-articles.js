module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Article', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()')
    },
    slug: {
      allowNull: {
        args: false,
        msg: 'Please enter a title'
      },
      type: Sequelize.TEXT
    },
    body: {
      allowNull: {
        args: false,
        msg: 'Please enter your text'
      },
      type: Sequelize.TEXT
    },
    title: {
      allowNull: {
        args: false,
        msg: 'Please give title'
      },
      type: Sequelize.TEXT
    },
    description: {
      allowNull: {
        args: false,
        msg: 'Please give description'
      },
      type: Sequelize.TEXT
    },
    authorId: {
      allowNull: false,
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'User',
        key: 'id'
      },
    },
    references: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    categoryId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Category',
        key: 'id',
      },
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
  down: queryInterface => queryInterface.dropTable('Article')
};
