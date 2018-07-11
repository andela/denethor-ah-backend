import bcrypt from 'bcrypt';

const saltRounds = 10;

/**
 * @export
 * @function Encryption
 * @param {String} password - password
 * @returns {String} hashed password
 */
export const encryptPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
};

/**
 * @param {String} password - password
 * @param {String} hash - hashed password
 * @returns {Boolean} true/false
 */
export const comparePassword = (password, hash) => bcrypt.compareSync(password, hash);
