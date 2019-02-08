import passport from 'passport';
import { passportCallback } from '../../server/api/middlewares/authentication/authenticate';

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */

export const user = {
  id: '8978654357896547896',
  name: { familyName: 'Dukuye', givenName: 'Omoefe' },
  emails: [{ value: 'omoefe.dukuye@gmail.com' }],
  photos: [{ value: 'uftyigilho;uogyfkgjhlugiy' }]
};

/**
 * @class Strategy
 */
class Strategy extends passport.Strategy {
  /**
   * Create an instance of Strategy.
   * @param {*} name
   * @param {*} callBack
   */
  constructor(name, callBack) {
    super(name, callBack);
    this.name = name;
    this._user = user;
    this._cb = callBack;
  }

  /**
   * @returns {Function} - Callback function
   */
  authenticate() {
    this._cb(null, null, this._user, (error, user) => {
      this.success(user);
    });
  }
}

export const mockStrategy = new Strategy('google', passportCallback);
