import { Router } from 'express';
import passport from 'passport';

import { newArticleValidator, ratingValidator, updateArticleValidator } from '../middlewares/validation/article';
import {
  createArticle, updateArticle, likeArticle, dislikeArticle, rateArticle,
  getAllArticles, getArticle, deleteArticle, filterArticle, getArticleRatings,
  getArticleLikes, getArticleDislikes
} from '../controllers/article';
import { reportArticle } from '../controllers/reports';
import { shareArticle } from '../controllers/shares';
import { commentsRouter } from './comment';
import highlightRouter from './highlight';

const articlesRouter = Router();

articlesRouter.post('/', passport.authenticate('jwt', { session: false }), newArticleValidator, createArticle);
articlesRouter.get('/', getAllArticles);
articlesRouter.get('/filter?', filterArticle);

articlesRouter.post('/:articleId/ratings', passport.authenticate('jwt', { session: false }), ratingValidator, rateArticle);
articlesRouter.get('/:articleId', getArticle);
articlesRouter.put('/:articleId', passport.authenticate('jwt', { session: false }), updateArticleValidator, updateArticle);
articlesRouter.delete('/:articleId', passport.authenticate('jwt', { session: false }), deleteArticle);
articlesRouter.get('/:articleId/likes', getArticleLikes);
articlesRouter.get('/:articleId/dislikes', getArticleDislikes);

articlesRouter.post('/:articleId/report', passport.authenticate('jwt', { session: false }), reportArticle);
articlesRouter.post('/:articleId/share', shareArticle);
articlesRouter.get('/:articleId/ratings', getArticleRatings);
articlesRouter.patch('/:articleId/likes', passport.authenticate('jwt', { session: false }), likeArticle);
articlesRouter.patch('/:articleId/dislikes', passport.authenticate('jwt', { session: false }), dislikeArticle);

articlesRouter.use('/:articleId/highlights', highlightRouter);
articlesRouter.use('/:articleId/comments', commentsRouter);

export default articlesRouter;
