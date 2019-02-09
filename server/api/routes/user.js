import { Router } from 'express';
import passport from 'passport';
import {
  registerUser, verifyUser, socialLogin, loginUser, logout, followUser
} from '../controllers/user';
import { registrationValidation, loginValidation } from '../middlewares/validation/user';

const userRouter = Router();

userRouter.post('/', registrationValidation, registerUser);
userRouter.post('/login', loginValidation, loginUser);
userRouter.post('/:userId/follow', passport.authenticate('jwt', { session: false }), followUser);

userRouter.patch('/:id', verifyUser);
userRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
userRouter.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));
userRouter.get('/twitter', passport.authenticate('twitter'));

userRouter.get('/google/redirect', passport.authenticate('google', { session: false }), socialLogin);

userRouter.get('/facebook/redirect', passport.authenticate('facebook', { session: false }), socialLogin);

userRouter.get('/twitter/redirect', passport.authenticate('twitter', { session: false }), socialLogin);

userRouter.get('/logout', logout);

export default userRouter;