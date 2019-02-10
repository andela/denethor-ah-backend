import { Router } from 'express';
import passport from 'passport';
import { newArticleValidator } from '../middlewares/validation/article';
import {
  createArticle, likeArticle, dislikeArticle, getAllArticles, getArticle
} from '../controllers/article';
import commentsRouter from './comment';

const articlesRouter = Router();

articlesRouter.post('/', passport.authenticate('jwt', { session: false }), newArticleValidator, createArticle);
articlesRouter.patch('/:id/likes', passport.authenticate('jwt', { session: false }), likeArticle);
articlesRouter.patch('/:id/dislikes', passport.authenticate('jwt', { session: false }), dislikeArticle);
articlesRouter.use('/:articleId/comments', commentsRouter);
articlesRouter.get('/', getAllArticles);
articlesRouter.get('/:id', getArticle);

export default articlesRouter;
