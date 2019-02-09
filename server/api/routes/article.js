import { Router } from 'express';
import passport from 'passport';
import { newArticleValidator } from '../middlewares/validation/article';
import { createArticle } from '../controllers/article';
import commentsRouter from './comment';

const articlesRouter = Router();

articlesRouter.post('/', passport.authenticate('jwt', { session: false }), newArticleValidator, createArticle);
articlesRouter.use('/:articleId/comments', commentsRouter);

export default articlesRouter;
