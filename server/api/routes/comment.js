import { Router } from 'express';
import passport from 'passport';
import { newCommentValidator, deleteCommentValidator } from '../middlewares/validation/comment';
import {
  postComment, getArticleComments, updateComment, deleteComment, likeComment
} from '../controllers/comments';

const commentsRouter = Router({ mergeParams: true });

commentsRouter.post('/', passport.authenticate('jwt', { session: false }), newCommentValidator, postComment);
commentsRouter.get('/', getArticleComments);
commentsRouter.patch('/:commentId', passport.authenticate('jwt', { session: false }),
  newCommentValidator, updateComment);

commentsRouter.delete('/:commentId', passport.authenticate('jwt', { session: false }),
  deleteCommentValidator,
  deleteComment);
commentsRouter.post('/:commentId/like', passport.authenticate('jwt', { session: false }), likeComment);

export default commentsRouter;
