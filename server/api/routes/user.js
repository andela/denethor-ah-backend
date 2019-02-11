import { Router } from 'express';
import passport from 'passport';
import {
  registerUser, verifyUser, socialLogin, loginUser, changeRole,
  logout, followUser, resetPasswordVerification, resetPassword, upgradeToAdmin
} from '../controllers/user';
import {
  registrationValidation, loginValidation, resetPasswordValidation,
  changePasswordValidation, changeRoleValidation
} from '../middlewares/validation/user';

const userRouter = Router();

userRouter.post('/', registrationValidation, registerUser);
userRouter.post('/login', loginValidation, loginUser);
userRouter.post('/:userId/follow', passport.authenticate('jwt', { session: false }), followUser);

userRouter.patch('/:id/verify', verifyUser);
userRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
userRouter.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));
userRouter.get('/twitter', passport.authenticate('twitter'));

userRouter.get('/google/redirect', passport.authenticate('google', { session: false }), socialLogin);

userRouter.get('/facebook/redirect', passport.authenticate('facebook', { session: false }), socialLogin);

userRouter.get('/twitter/redirect', passport.authenticate('twitter', { session: false }), socialLogin);

userRouter.get('/logout', logout);
userRouter.post('/resetPassword', resetPasswordValidation, resetPasswordVerification);
userRouter.patch('/resetPassword/:token', changePasswordValidation, resetPassword);

userRouter.patch('/role', passport.authenticate('jwt', { session: false }), changeRoleValidation, changeRole);

userRouter.patch('/admin', passport.authenticate('jwt', { session: false }), upgradeToAdmin);

export default userRouter;
