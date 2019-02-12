"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetPasswordVerificationMail = exports.sendVerificationMail = void 0;

var _mail = _interopRequireDefault(require("@sendgrid/mail"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _templates = _interopRequireDefault(require("./templates"));

var _resetPasswordTemplates = _interopRequireDefault(require("./resetPasswordTemplates"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv.default.config();

_mail.default.setApiKey(process.env.SENDGRID_KEY);
/**
  * @export
  * @function sendVerificationMail
  * @param {Object} username - created User's username
  * @param {Object} email - created User's email
  * @param {Object} url - created User's ID
  * @returns {null} null
  */


const sendVerificationMail = (username, email, url) => {
  const msg = {
    to: email,
    from: 'support@authors-haven.com',
    subject: '[Author\'s Haven] Email Verification',
    html: (0, _templates.default)(username, url)
  };
  return _mail.default.send(msg);
};

exports.sendVerificationMail = sendVerificationMail;

const resetPasswordVerificationMail = (username, email, token) => {
  const msg = {
    to: email,
    from: 'support@authors-haven.com',
    subject: '[Author\'s Haven] Email Verification',
    html: (0, _resetPasswordTemplates.default)(username, token)
  };
  return _mail.default.send(msg);
};

exports.resetPasswordVerificationMail = resetPasswordVerificationMail;