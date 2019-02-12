"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCommentSchema = exports.newCommentSchema = void 0;

var _joi = _interopRequireDefault(require("joi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const articleId = _joi.default.string().trim().min(1).required();

const commentId = _joi.default.string().trim().min(1).required();

const commentBody = _joi.default.string().trim().min(1).max(140).required();

const newCommentSchema = {
  commentBody,
  articleId
};
exports.newCommentSchema = newCommentSchema;
const updateCommentSchema = {
  commentBody,
  articleId,
  commentId
};
exports.updateCommentSchema = updateCommentSchema;