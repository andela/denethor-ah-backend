import { Router } from 'express';
import passport from 'passport';
import {
  newArticleValidator, createHighlightValidator, ratingValidator
} from '../middlewares/validation/article';
import {
  createArticle, likeArticle, dislikeArticle, createHighlight, getHighlights, rateArticle,
  getAllArticles, getArticle
} from '../controllers/article';

import commentsRouter from './comment';

const articlesRouter = Router();

articlesRouter.post('/', passport.authenticate('jwt', { session: false }), newArticleValidator, createArticle);
articlesRouter.patch('/:id/likes', passport.authenticate('jwt', { session: false }), likeArticle);
articlesRouter.patch('/:id/dislikes', passport.authenticate('jwt', { session: false }), dislikeArticle);
articlesRouter.post('/:id/highlights',
  passport.authenticate('jwt', { session: false }),
  createHighlightValidator,
  createHighlight);
articlesRouter.get('/:id/highlights', passport.authenticate('jwt', { session: false }), getHighlights);
articlesRouter.post('/:articleId/ratings', passport.authenticate('jwt', { session: false }), ratingValidator, rateArticle);

articlesRouter.use('/:articleId/comments', commentsRouter);
articlesRouter.get('/', getAllArticles);
articlesRouter.get('/:id', getArticle);

export default articlesRouter;
