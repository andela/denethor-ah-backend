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
    this.resetPassword = { email };
    this.logIn = { email, password };
    this.signUp = {
      ...this.logIn, firstname, lastname, username
    };
  }
}


export const user1 = new MockUser('Johnny', 'Bravo', 'johnnybravo1', 'user1@example.test', 'secretpassword');
export const user2 = new MockUser('Mathias', 'Bravo', 'johnnybravo2', 'user2@example.test', 'secretpassword');
export const user3 = new MockUser('Johnny', 'Bravo', 'johnnybravo3', 'user3@example.test', 'secretpassword');
export const user4 = new MockUser('Mathias', 'Bravo', 'johnnybravo4', 'user4@example.test', 'secretpassword');
