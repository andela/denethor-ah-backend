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
export const user5 = new MockUser('Johnny', 'Bravo', 'johnnybravo5', 'user5@example.test', 'secretpassword');
export const user6 = new MockUser('Mathias', 'Bravo', 'johnnybravo6', 'user6@example.test', 'secretpassword');
export const user7 = new MockUser('Princess', 'Grahambel', 'orincessgarham', 'user7@example.test', 'secretpassword');
export const user8 = new MockUser('Pearl', 'Egbuna', 'pearl', 'user8@example.test', 'secretpassword');
export const user9 = new MockUser('Amanda', 'Egbuna', 'amanda', 'user9@example.test', 'secretpassword');
export const user10 = new MockUser('Prince', 'Egbuna', 'prince', 'user10@example.test', 'secretpassword');
export const user11 = new MockUser('Innocent', 'Grahambel', 'innocent', 'user11@example.test', 'secretpassword');
export const user12 = new MockUser('Pamela', 'Grahambel', 'pamela', 'user12@example.test', 'secretpassword');
export const user13 = new MockUser('Bams', 'Gbajigs', 'bams', 'user12@example.test', 'secretpassword');
export const user14 = new MockUser('Bavbms', 'Gbaggvjigs', 'bamufyfds3', 'usergfc12@example.test', 'secretpassword');
export const user15 = new MockUser('Bavbm', 'Gbaggvjig', 'bamufys3', 'usergfc@example.test', 'secretpassword');
