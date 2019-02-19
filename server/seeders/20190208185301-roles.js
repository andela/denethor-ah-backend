module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Roles', [{
      name: 'admin'
    }, {
      name: 'author'
    }, {
      name: 'super-admin'
    }], {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Roles', null, {});
  }
};
