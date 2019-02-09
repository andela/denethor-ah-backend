import { Router } from 'express';
import passport from 'passport';
import { newCommentValidator } from '../middlewares/validation/comment';
import { postComment } from '../controllers/comments';

const commentsRouter = Router({ mergeParams: true });


commentsRouter.post('/', passport.authenticate('jwt', { session: false }), newCommentValidator, postComment);

export default commentsRouter;
