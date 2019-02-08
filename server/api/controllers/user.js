import Sequelize from 'sequelize';
import { createLogger, format, transports } from 'winston';
import { signToken } from '../helpers/tokenization/tokenize';
import { User } from '../../models';
import sendVerificationMail from '../helpers/mailer/mailer';

const logger = createLogger({
  level: 'debug',
  format: format.simple(),
  transports: [new transports.Console()]
});

const { Op } = Sequelize;

/**
* @export
* @function registerUser
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
* @memberof Tokenize
*/
export const registerUser = async (req, res) => {
  const {
    firstname, lastname, username, email, password,
  } = req.body;

  try {
    const foundUser = await User.findOne({ where: { email: { [Op.eq]: email } } });

    if (foundUser) {
      return res.status(409).send({
        status: 'fail',
        data: { email: 'User with this email already exist.' }
      });
    }

    const createdUser = await User.create({
      firstname,
      lastname,
      username,
      email,
      password,
    });

    try {
      await sendVerificationMail(username, email, createdUser.id);
    } catch (error) {
      logger.debug('Email Error::', error);
    }

    return res.status(200).send({
      status: 'success',
      data: {
        message: `A confirmation email has been sent to ${email}. Click on the confirmation button to verify the account`,
        link: `${req.protocol}://${req.headers.host}/api/users/${createdUser.id}`
      },
    });
  } catch (e) {
    res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const unverifiedUser = await User.findByPk(id);

    if (!unverifiedUser) {
      return res.status(404).send({
        status: 'fail',
        data: { message: 'user does not exist' }
      });
    }

    if (unverifiedUser.isVerified) {
      return res.status(400).send({
        status: 'fail',
        message: 'User is already verified'
      });
    }

    const updatedUser = await unverifiedUser.update({ isVerified: true },
      { returning: true, plain: true });
    const token = signToken({ id, email: updatedUser.email });

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'Verification successful. You\'re all set!',
        user: {
          username: updatedUser.username,
          email: updatedUser.email,
          token
        }
      }
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

export const socialLogin = async (req, res) => {
  const {
    firstname, lastname, username, email, password, imageUrl
  } = req.user;
  try {
    const { id } = await User.findOrCreate({
      where: { email },
      defaults: {
        firstname, lastname, username, password, imageUrl, isVerified: true
      }
    });

    const token = signToken({ id, email });

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'login successful',
        user: { username, email },
        token
      }
    });
  } catch (e) {
    res.status(500).send({
      status: 'fail',
      message: 'internal server error occured'
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({
        error: {
          message: 'server error',
          error: err
        }
      });
    }
  });
  return res.status(200).send({
    status: 'success',
    message: 'You successfully logged out'
  });
};

/**
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} response object
 */
export const loginUser = async (req, res) => {
  const userCredentials = req.body;
  const { email, password } = userCredentials;

  // Check if the user exists in the database
  const foundUser = await User.findOne({ where: { email: { [Op.eq]: email } } });

  if (!foundUser) {
    return res.status(401).json({
      status: 'fail',
      message: 'Provide correct login credentials',
    });
  }

  if (!User.passwordMatch(foundUser.password, password)) {
    return res.status(401).json({
      status: 'fail',
      message: 'Provide correct login credentials',
    });
  }

  const token = signToken({
    id: foundUser.id,
    email,
  });

  return res.status(200).send({
    status: 'success',
    data: {
      userId: foundUser.id,
      email,
      token
    }
  });
};

/**
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} response object
 */
export const followUser = async (req, res) => {
  const { userId } = req.params;

  // req.user is available after password authenticates user
  const followerId = req.user.id;

  try {
    let followedUser = await User.findByPk(userId);
    const followingUser = await User.findByPk(followerId);

    if (!followedUser || !followingUser) {
      return res.status(404).send({
        status: 'fail',
        message: 'account(s) not found'
      });
    }

    await followedUser.addFollowers(followingUser);

    // get all followers retrieving only id
    const userFollowers = await followedUser.getFollowers({
      attributes: ['id']
    });

    followedUser = followedUser.toJSON();
    followedUser.followers = userFollowers.map(item => item.id);

    // add the number of followers the followed user has
    followedUser.followersCount = userFollowers.length;

    // return the followed user
    return res.status(201).send({
      status: 'success',
      data: followedUser
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured',
    });
  }
};
