module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('User', [{
      firstname: 'Adanne1',
      lastname: 'Egbuna2',
      username: 'testuser3',
      email: 'princess63@example.com',
      password: 'password',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('User', null, {});
  }
};
