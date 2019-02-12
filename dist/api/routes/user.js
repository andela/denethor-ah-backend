"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _user = require("../controllers/user");

var _user2 = require("../middlewares/validation/user");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const userRouter = (0, _express.Router)();
userRouter.post('/', _user2.registrationValidation, _user.registerUser);
userRouter.post('/login', _user2.loginValidation, _user.loginUser);
userRouter.post('/:userId/follow', _passport.default.authenticate('jwt', {
  session: false
}), _user.followUser);
userRouter.patch('/:id/verify', _user.verifyUser);
userRouter.get('/google', _passport.default.authenticate('google', {
  scope: ['profile', 'email']
}));
userRouter.get('/facebook', _passport.default.authenticate('facebook', {
  scope: 'email'
}));
userRouter.get('/twitter', _passport.default.authenticate('twitter'));
userRouter.get('/google/redirect', _passport.default.authenticate('google', {
  session: false
}), _user.socialLogin);
userRouter.get('/facebook/redirect', _passport.default.authenticate('facebook', {
  session: false
}), _user.socialLogin);
userRouter.get('/twitter/redirect', _passport.default.authenticate('twitter', {
  session: false
}), _user.socialLogin);
userRouter.get('/logout', _user.logout);
userRouter.post('/resetPassword', _user2.resetPasswordValidation, _user.resetPasswordVerification);
userRouter.patch('/resetPassword/:token', _user2.changePasswordValidation, _user.resetPassword);
userRouter.patch('/role', _passport.default.authenticate('jwt', {
  session: false
}), _user2.changeRoleValidation, _user.changeRole);
userRouter.patch('/admin', _passport.default.authenticate('jwt', {
  session: false
}), _user.upgradeToAdmin);
var _default = userRouter;
exports.default = _default;