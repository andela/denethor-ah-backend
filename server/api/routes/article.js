import { Router } from 'express';
import passport from 'passport';

import { newArticleValidator, ratingValidator, updateArticleValidator } from '../middlewares/validation/article';
import {
  createArticle, updateArticle, likeArticle, dislikeArticle, rateArticle,
  getAllArticles, getArticle, deleteArticle, filterArticle, getArticleRatings
} from '../controllers/article';
import { reportArticle } from '../controllers/reports';
import { shareArticle } from '../controllers/shares';
import commentsRouter from './comment';
import highlightRouter from './highlight';

const articlesRouter = Router();

articlesRouter.post('/', passport.authenticate('jwt', { session: false }), newArticleValidator, createArticle);
articlesRouter.get('/filter?', passport.authenticate('jwt', { session: false }), filterArticle);
articlesRouter.put('/:articleId', passport.authenticate('jwt', { session: false }), updateArticleValidator, updateArticle);
articlesRouter.delete('/:articleId', passport.authenticate('jwt', { session: false }), deleteArticle);
articlesRouter.get('/:articleId/ratings', getArticleRatings);
articlesRouter.patch('/:id/likes', passport.authenticate('jwt', { session: false }), likeArticle);
articlesRouter.patch('/:id/dislikes', passport.authenticate('jwt', { session: false }), dislikeArticle);

articlesRouter.post('/:articleId/ratings', passport.authenticate('jwt', { session: false }), ratingValidator, rateArticle);

articlesRouter.use('/:articleId/highlights', highlightRouter);
articlesRouter.use('/:articleId/comments', commentsRouter);
articlesRouter.get('/', getAllArticles);
articlesRouter.get('/:id', getArticle);
articlesRouter.post('/:id/report', passport.authenticate('jwt', { session: false }), reportArticle);
articlesRouter.post('/:id/share', shareArticle);

export default articlesRouter;
