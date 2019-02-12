"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ratingValidator = exports.createHighlightValidator = exports.newArticleValidator = void 0;

var _joi = _interopRequireDefault(require("joi"));

var _article = require("./schemas/article");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* @export
* @function newArticleValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
const newArticleValidator = (req, res, next) => {
  _joi.default.validate(req.body, _article.newArticleSchema).then(() => {
    next();
  }).catch(error => {
    res.status(422).send({
      error
    });
  });
};
/**
* @export
* @function createHighlightValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/


exports.newArticleValidator = newArticleValidator;

const createHighlightValidator = (req, res, next) => {
  _joi.default.validate(req.body, _article.createHighlightSchema).then(() => next()).catch(error => res.status(422).send({
    status: 'fail',
    data: {
      input: error.details[0].message
    }
  }));
};
/**
* @export
* @function ratingValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/


exports.createHighlightValidator = createHighlightValidator;

const ratingValidator = (req, res, next) => {
  _joi.default.validate(req.body, _article.ratingSchema).then(() => next()).catch(error => res.status(422).send({
    status: 'fail',
    data: {
      input: error.details[0].message
    }
  }));
};

exports.ratingValidator = ratingValidator;