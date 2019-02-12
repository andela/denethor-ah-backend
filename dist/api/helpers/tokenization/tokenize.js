"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyToken = exports.signToken = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv.default.config();

const secret = process.env.JWT_SECRET;
/**
 * @export
 * @function signToken
 * @param {Object} payload - user object
 * @param {string} exp - exp default 24hours
 * @returns {string} Jwt token
 */

const signToken = (payload, exp = '24h') => _jsonwebtoken.default.sign(payload, secret, {
  expiresIn: exp
});
/**
 * @export
 * @function verifyToken
 * @param {Object} token - JWT token
 * @returns {string} Payload
 */


exports.signToken = signToken;

const verifyToken = token => _jsonwebtoken.default.verify(token, secret);

exports.verifyToken = verifyToken;