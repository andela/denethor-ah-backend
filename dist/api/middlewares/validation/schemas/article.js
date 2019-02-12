"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ratingSchema = exports.createHighlightSchema = exports.newArticleSchema = void 0;

var _joi = _interopRequireDefault(require("joi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const title = _joi.default.string().min(10).required();

const description = _joi.default.string().min(10).required();

const body = _joi.default.string().min(20).required();

const references = _joi.default.array().items(_joi.default.string());

const categoryId = _joi.default.number().required();

const tags = _joi.default.string();

const highlight = _joi.default.string().trim().min(1).required();

const comment = _joi.default.string().trim().min(1).required();

const rating = _joi.default.number().integer().min(1).max(5).required();

const newArticleSchema = {
  title,
  description,
  body,
  references,
  categoryId,
  tags
};
exports.newArticleSchema = newArticleSchema;
const createHighlightSchema = {
  highlight,
  comment
};
exports.createHighlightSchema = createHighlightSchema;
const ratingSchema = {
  rating
};
exports.ratingSchema = ratingSchema;