import { User } from '../../models';

const passwordChecker = (req, res, next) => {
  const { body: { oldPassword }, user } = req;
  if (oldPassword) {
    if (!User.passwordMatch(user.password, oldPassword)) {
      return res.status(403).send({
        status: 'fail',
        message: 'The old password you have entered is incorrect'
      });
    }
  }
  next();
};

export default passwordChecker;
