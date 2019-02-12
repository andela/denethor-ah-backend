"use strict";

module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert('Category', [{
      categoryName: 'tech'
    }], {});
  },
  down: queryInterface => {
    return queryInterface.bulkDelete('Category', null, {});
  }
};