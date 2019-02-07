/**
 * class for creating mock users
 */
class MockUser {
  /**
   *
   * @param {*} firstname
   * @param {*} lastname
   * @param {*} username
   * @param {*} email
   * @param {*} password
   */
  constructor(
    firstname, lastname, username, email, password
  ) {
    this.logIn = { email, password };
    this.signUp = {
      ...this.logIn, firstname, lastname, username
    };
  }
}


export const user1 = new MockUser('Johnny', 'Bravo', 'johnnybravo2', 'user1@example.test', 'secretpassword');
