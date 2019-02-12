import { Router } from 'express';
import passport from 'passport';
import { newCommentValidator } from '../middlewares/validation/comment';
import { postComment, updateComment } from '../controllers/comments';

const commentsRouter = Router({ mergeParams: true });


commentsRouter.post('/', passport.authenticate('jwt', { session: false }), newCommentValidator, postComment);
commentsRouter.patch('/:commentId', passport.authenticate('jwt', { session: false }),
  newCommentValidator, updateComment);

export default commentsRouter;
