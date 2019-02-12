"use strict";

module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('Roles', [{
      name: 'admin'
    }, {
      name: 'author'
    }], {});
  },
  down: queryInterface => {
    return queryInterface.bulkDelete('Roles', null, {});
  }
};