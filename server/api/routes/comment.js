import { Router } from 'express';
import passport from 'passport';
import { newCommentValidator, deleteCommentValidator } from '../middlewares/validation/comment';
import {
  postComment, getArticleComments, updateComment, deleteComment, likeComment, getCommentLikes
} from '../controllers/comments';

const commentsRouter = Router({ mergeParams: true });
const commentRoutes = Router();

commentsRouter.post('/', passport.authenticate('jwt', { session: false }), newCommentValidator, postComment);
commentsRouter.get('/', getArticleComments);
commentsRouter.patch('/:commentId', passport.authenticate('jwt', { session: false }),
  newCommentValidator, updateComment);

commentsRouter.delete('/:commentId', passport.authenticate('jwt', { session: false }),
  deleteCommentValidator,
  deleteComment);
commentRoutes.post('/:commentId/likes', passport.authenticate('jwt', { session: false }), likeComment);
commentRoutes.get('/:commentId/likes', getCommentLikes);

export { commentsRouter, commentRoutes };
