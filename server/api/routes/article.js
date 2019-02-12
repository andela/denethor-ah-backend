import { Router } from 'express';
import passport from 'passport';
import {
  newArticleValidator, createHighlightValidator, ratingValidator, updateArticleValidator
} from '../middlewares/validation/article';
import {
  createArticle, updateArticle, likeArticle, dislikeArticle, createHighlight, getHighlights, rateArticle,
  getAllArticles, getArticle, deleteArticle
} from '../controllers/article';
import { reportArticle } from '../controllers/reports';
import commentsRouter from './comment';

const articlesRouter = Router();

articlesRouter.post('/', passport.authenticate('jwt', { session: false }), newArticleValidator, createArticle);
articlesRouter.put('/:articleId', passport.authenticate('jwt', { session: false }), updateArticleValidator, updateArticle);
articlesRouter.delete('/:articleId', passport.authenticate('jwt', { session: false }), deleteArticle);
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
articlesRouter.post('/:id/report', passport.authenticate('jwt', { session: false }), reportArticle);

export default articlesRouter;
