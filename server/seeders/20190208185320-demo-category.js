module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Category', [{
      categoryName: 'fashion'
    }], {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Category', null, {});
  }
};
