"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCommentValidator = exports.newCommentValidator = void 0;

var _joi = _interopRequireDefault(require("joi"));

var _comment = require("./schemas/comment");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const newCommentValidator = ({
  params: {
    articleId
  },
  body: {
    commentBody
  }
}, res, next) => {
  const payload = {
    articleId,
    commentBody
  };

  _joi.default.validate(payload, _comment.newCommentSchema).then(() => {
    next();
  }).catch(error => {
    res.status(422).send({
      status: 'fail',
      message: error
    });
  });
};

exports.newCommentValidator = newCommentValidator;

const updateCommentValidator = ({
  params: {
    articleId,
    commentId
  },
  body: {
    commentBody
  }
}, res, next) => {
  const payload = {
    articleId,
    commentId,
    commentBody
  };

  _joi.default.validate(payload, _comment.updateCommentSchema).then(() => {
    next();
  }).catch(error => {
    res.status(422).send({
      status: 'fail',
      message: error
    });
  });
};

exports.updateCommentValidator = updateCommentValidator;