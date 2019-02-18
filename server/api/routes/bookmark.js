import { Router } from 'express';
import passport from 'passport';
import { createBookmark, deleteBookmark, getUserBookmarks } from '../controllers/bookmark';

const bookmarksRouter = Router();

bookmarksRouter.post('/articles/:articleId/bookmark', passport.authenticate('jwt', { session: false }), createBookmark);
bookmarksRouter.delete('/articles/:articleId/bookmark', passport.authenticate('jwt', { session: false }), deleteBookmark);
bookmarksRouter.get('/users/:userId/bookmarks', passport.authenticate('jwt', { session: false }), getUserBookmarks);

export default bookmarksRouter;
