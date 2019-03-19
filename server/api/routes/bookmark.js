import { Router } from 'express';
import passport from 'passport';
import { createBookmark, deleteBookmark, getUserBookmarks } from '../controllers/bookmark';

const bookmarksRouter = Router();

bookmarksRouter.post('/', passport.authenticate('jwt', { session: false }), createBookmark);
bookmarksRouter.delete('/', passport.authenticate('jwt', { session: false }), deleteBookmark);
bookmarksRouter.get('/', passport.authenticate('jwt', { session: false }), getUserBookmarks);

export default bookmarksRouter;
