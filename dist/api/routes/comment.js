"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _comment = require("../middlewares/validation/comment");

var _comments = require("../controllers/comments");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const commentsRouter = (0, _express.Router)({
  mergeParams: true
});
commentsRouter.post('/', _passport.default.authenticate('jwt', {
  session: false
}), _comment.newCommentValidator, _comments.postComment);
commentsRouter.patch('/:commentId', _passport.default.authenticate('jwt', {
  session: false
}), _comment.newCommentValidator, _comments.updateComment);
var _default = commentsRouter;
exports.default = _default;