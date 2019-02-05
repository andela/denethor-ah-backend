const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  development: {
    url: process.env.DENETHOR_URL_DEV,
    dialect: 'postgres',
    operatorsAliases: false
  },
  test: {
    url: process.env.DENETHOR_URL_TEST,
    dialect: 'postgres',
    operatorsAliases: false
  },
  production: {
    url: process.env.DENETHOR_URL_PROD,
    dialect: 'postgres',
    operatorsAliases: false
  },
};
