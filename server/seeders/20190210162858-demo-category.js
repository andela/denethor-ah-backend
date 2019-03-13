module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Category', [{
      categoryName: 'tech',
    }, {
      categoryName: 'fashion',
    }, {
      categoryName: 'health',
    }, {
      categoryName: 'education',
    }, {
      categoryName: 'lifestyle',
    }, {
      categoryName: 'wellness',
    }, {
      categoryName: 'politics',
    }, {
      categoryName: 'design',
    }, {
      categoryName: 'science',
    }], {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Category', null, {});
  }
};
