import { Router } from 'express';
import passport from 'passport';

import { getTags } from '../controllers/tags';

const tagsRouter = Router();

tagsRouter.get('/', passport.authenticate('jwt', { session: false }), getTags);

export default tagsRouter;
