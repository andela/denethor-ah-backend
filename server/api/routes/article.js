import { Router } from 'express';
import passport from 'passport';
import { newArticleValidator, createHighlightValidator } from '../middlewares/validation/article';
import {
  createArticle, likeArticle, dislikeArticle, createHighlight, getHighlights
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

articlesRouter.use('/:articleId/comments', commentsRouter);

export default articlesRouter;
