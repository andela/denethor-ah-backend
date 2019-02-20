import { Router } from 'express';
import passport from 'passport';
import {
  registerUser, verifyUser, socialLogin, loginUser, changeRole, listAuthors, unsubscribeMail,
  logout, followUser, unfollowUser, resetPasswordVerification, resetPassword,
  getUser, deleteUser, getUserProfile, uploadProfileImage, updateUserProfile
} from '../controllers/user';
import {
  registrationValidation, loginValidation, resetPasswordValidation,
  changePasswordValidation, changeRoleValidation, profileUpdateValidation
} from '../middlewares/validation/user';

const userRouter = Router();

userRouter.post('/', registrationValidation, registerUser);
userRouter.post('/login', loginValidation, loginUser);
userRouter.post('/:userId/follow', passport.authenticate('jwt', { session: false }), followUser);
userRouter.delete('/:userId/follow', passport.authenticate('jwt', { session: false }), unfollowUser);

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

userRouter.get('/', passport.authenticate('jwt', { session: false }), listAuthors);
userRouter.get('/:id', passport.authenticate('jwt', { session: false }), getUser);
userRouter.delete('/:id', passport.authenticate('jwt', { session: false }), deleteUser);
userRouter.post('/:userId/profile/upload', passport.authenticate('jwt', { session: false }), uploadProfileImage);
userRouter.get('/:userId/profile', getUserProfile);
userRouter.patch('/:userId/profile', passport.authenticate('jwt', { session: false }),
  profileUpdateValidation, updateUserProfile);

userRouter.patch('/:id/unsubscribe', passport.authenticate('jwt', { session: false }), unsubscribeMail);

export default userRouter;
