"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _article = require("../middlewares/validation/article");

var _article2 = require("../controllers/article");

var _comment = _interopRequireDefault(require("./comment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const articlesRouter = (0, _express.Router)();
articlesRouter.post('/', _passport.default.authenticate('jwt', {
  session: false
}), _article.newArticleValidator, _article2.createArticle);
articlesRouter.patch('/:id/likes', _passport.default.authenticate('jwt', {
  session: false
}), _article2.likeArticle);
articlesRouter.patch('/:id/dislikes', _passport.default.authenticate('jwt', {
  session: false
}), _article2.dislikeArticle);
articlesRouter.post('/:id/highlights', _passport.default.authenticate('jwt', {
  session: false
}), _article.createHighlightValidator, _article2.createHighlight);
articlesRouter.get('/:id/highlights', _passport.default.authenticate('jwt', {
  session: false
}), _article2.getHighlights);
articlesRouter.post('/:articleId/ratings', _passport.default.authenticate('jwt', {
  session: false
}), _article.ratingValidator, _article2.rateArticle);
articlesRouter.use('/:articleId/comments', _comment.default);
articlesRouter.get('/', _article2.getAllArticles);
articlesRouter.get('/:id', _article2.getArticle);
var _default = articlesRouter;
exports.default = _default;