const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  development: {
    url: process.env.DENETHOR_DEV,
    dialect: 'postgres',
    operatorsAliases: false
  }
};
