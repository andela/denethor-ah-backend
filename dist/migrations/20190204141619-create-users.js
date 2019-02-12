"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').then(() => queryInterface.sequelize.query(`CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
      ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;`)).then(() => queryInterface.createTable('User', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      firstname: {
        allowNull: {
          args: false,
          msg: 'Please enter a username'
        },
        type: Sequelize.STRING
      },
      lastname: {
        allowNull: {
          args: false,
          msg: 'Please enter a username'
        },
        type: Sequelize.STRING
      },
      username: {
        allowNull: {
          args: false,
          msg: 'Please enter a username'
        },
        type: Sequelize.STRING,
        unique: {
          args: true,
          msg: 'Username already exist'
        }
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        allowNull: {
          args: false,
          msg: 'Please enter a password'
        },
        type: Sequelize.STRING,
        validate: {
          len: [8, 72]
        }
      },
      role: {
        allowNull: false,
        type: Sequelize.TEXT,
        defaultValue: 'author',
        onDelete: 'CASCADE',
        references: {
          model: 'Roles',
          key: 'name'
        }
      },
      bio: {
        type: Sequelize.TEXT
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      isVerified: {
        defaultValue: false,
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
    }));
  },

  down: async queryInterface => {
    await queryInterface.dropTable('User');
    await queryInterface.dropTable('session');
  }
};