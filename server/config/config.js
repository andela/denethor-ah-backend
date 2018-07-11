const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL_DEV,
    dialect: 'postgres',
    operatorsAliases: false
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    operatorsAliases: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    operatorsAliases: false
  },
};
