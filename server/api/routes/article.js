import { Router } from 'express';
import passport from 'passport';
import { newArticleValidator } from '../middlewares/validation/article';
import { createArticle } from '../controllers/article';

const articlesRouter = Router();


articlesRouter.post('/', passport.authenticate('jwt', { session: false }), newArticleValidator, createArticle);

export default articlesRouter;
