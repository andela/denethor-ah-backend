"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changePasswordSchema = exports.resetPasswordSchema = exports.registrationRequestSchema = exports.loginRequestSchema = void 0;

var _joi = _interopRequireDefault(require("joi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const firstname = _joi.default.string().trim().strict().min(3).required();

const lastname = _joi.default.string().trim().strict().min(3).required();

const username = _joi.default.string().trim().alphanum().min(3).max(30).required();

const email = _joi.default.string().trim().strict().min(10).max(100).email().required();

const password = _joi.default.string().trim().strict().alphanum().min(8).max(40).required();

const registrationRequestSchema = {
  firstname,
  lastname,
  username,
  email,
  password
};
exports.registrationRequestSchema = registrationRequestSchema;
const loginRequestSchema = {
  email,
  password
};
exports.loginRequestSchema = loginRequestSchema;
const resetPasswordSchema = {
  email
};
exports.resetPasswordSchema = resetPasswordSchema;
const changePasswordSchema = {
  password
};
exports.changePasswordSchema = changePasswordSchema;