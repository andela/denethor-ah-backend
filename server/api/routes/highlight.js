import { Router } from 'express';
import passport from 'passport';

import {
  createHighlightValidator, getHighlightsValidator, editHighlightValidator, deleteHighlightValidator
} from '../middlewares/validation/highlight';
import {
  createHighlight, getHighlights, editHighlight, deleteHighlight
} from '../controllers/highlight';

const highlightRouter = Router({ mergeParams: true });

highlightRouter.post('/', passport.authenticate('jwt', { session: false }),
  createHighlightValidator,
  createHighlight);

highlightRouter.get('/', passport.authenticate('jwt', { session: false }),
  getHighlightsValidator,
  getHighlights);

highlightRouter.patch('/:highlightId', passport.authenticate('jwt', { session: false }),
  editHighlightValidator,
  editHighlight);

highlightRouter.delete('/:highlightId', passport.authenticate('jwt', { session: false }),
  deleteHighlightValidator,
  deleteHighlight);

export default highlightRouter;
