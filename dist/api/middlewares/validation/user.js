"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeRoleValidation = exports.changePasswordValidation = exports.resetPasswordValidation = exports.loginValidation = exports.registrationValidation = void 0;

var _joi = _interopRequireDefault(require("joi"));

var _user = require("./schemas/user");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* @export
* @function registrationValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
const registrationValidation = (req, res, next) => {
  _joi.default.validate(req.body, _user.registrationRequestSchema).then(() => next()).catch(error => res.status(422).send({
    status: 'fail',
    data: {
      input: error.details[0].message
    }
  }));
};
/**
* @export
* @function loginValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/


exports.registrationValidation = registrationValidation;

const loginValidation = (req, res, next) => {
  _joi.default.validate(req.body, _user.loginRequestSchema).then(() => next()).catch(error => res.status(422).send({
    status: 'fail',
    data: {
      input: error.details[0].message
    }
  }));
};
/**
* @export
* @function requestPasswordValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/


exports.loginValidation = loginValidation;

const resetPasswordValidation = (req, res, next) => {
  _joi.default.validate(req.body, _user.resetPasswordSchema).then(() => next()).catch(error => res.status(422).send({
    status: 'fail',
    data: {
      input: error.details[0].message
    }
  }));
};
/**
* @export
* @function requestPasswordValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/


exports.resetPasswordValidation = resetPasswordValidation;

const changePasswordValidation = (req, res, next) => {
  _joi.default.validate(req.body, _user.changePasswordSchema).then(() => next()).catch(error => res.status(422).send({
    status: 'fail',
    data: {
      input: error.details[0].message
    }
  }));
};
/**
* @export
* @function requestPasswordValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/


exports.changePasswordValidation = changePasswordValidation;

const changeRoleValidation = ({
  user: {
    role
  },
  body: {
    role: proposedRole
  }
}, res, next) => {
  if (role !== 'admin') {
    return res.status(401).send({
      status: 'fail',
      message: 'only admins can change user roles'
    });
  }

  const availableRoles = ['admin', 'author'];

  if (!availableRoles.includes(proposedRole)) {
    return res.status(422).send({
      status: 'fail',
      message: 'not a valid role'
    });
  }

  next();
};

exports.changeRoleValidation = changeRoleValidation;