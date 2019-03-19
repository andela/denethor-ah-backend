import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import _cloudinary from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import { createLogger, format, transports } from 'winston';
import { signToken, verifyToken } from '../helpers/tokenization/tokenize';
import { User, Article } from '../../models';
import { sendVerificationMail, resetPasswordVerificationMail } from '../helpers/mailer/mailer';

dotenv.config();

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

    const link = process.env.NODE_ENV === 'production'
      ? `${process.env.REACT_ENDPOINT}/api/users/${createdUser.id}/verify`
      : `${req.protocol}://${req.headers.host}/api/users/${createdUser.id}/verify`;

    if (process.env.NODE_ENV === 'production') {
      try {
        await sendVerificationMail(username, email, link);
      } catch (error) {
        logger.debug('Email Error::', error);
      }
    }

    return res.status(201).send({
      status: 'success',
      data: {
        message: `A confirmation email has been sent to ${email}. Click on the confirmation button to verify the account`,
        link
      },
    });
  } catch (e) {
    res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

/**
* @export
* @function verifyUser
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
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

    const { email, username, role } = await unverifiedUser.update({ isVerified: true },
      { returning: true, plain: true });
    const token = signToken({
      sid: req.sessionID,
      id,
      email,
      role
    });

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'Verification successful. You\'re all set!',
        user: {
          id, username, email, token, role
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
    const [{ id, role, isVerified }] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstname, lastname, username, password, imageUrl
      }
    });

    let token;
    const paramToken = !isVerified && signToken({ email }, '10m');

    if (process.env.NODE_ENV === 'production' && !isVerified) {
      try {
        await resetPasswordVerificationMail(username, email, paramToken);
      } catch (error) {
        logger.debug('Email Error::', error);
      }
    } else if (isVerified) {
      token = signToken({
        sid: req.sessionID,
        id,
        email,
        role
      });
    }

    const verifiedUrl = `dashboard#token=${token}`;

    return res.redirect(
      `${process.env.REACT_ENDPOINT}/${
        isVerified
          ? verifiedUrl
          : 'signup?mailalert=true'
      }`
    );
  } catch (e) {
    return res.status(500).send({
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
    return res.status(401).send({
      status: 'fail',
      message: 'Provide correct login credentials',
    });
  }

  if (!foundUser.isVerified) {
    return res.status(403).send({
      status: 'fail',
      message: 'Email not verified'
    });
  }

  if (!User.passwordMatch(foundUser.password, password)) {
    return res.status(401).send({
      status: 'fail',
      message: 'Provide correct login credentials',
    });
  }

  const { id, role } = foundUser;

  const token = signToken({
    sid: req.sessionID,
    id,
    email,
    role
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

  // req.user is available after passport authenticates user
  const followerId = req.user.id;

  try {
    // use one query to get the two users
    // fetching id only because we don't need other fields for the operation here
    const users = await User.findAll({
      where: { id: { [Op.in]: [userId, followerId] } },
      attributes: ['id']
    });

    if (users.length < 2) {
      return res.status(404).send({
        status: 'fail',
        message: 'account(s) not found'
      });
    }

    let followedUser = users.find(user => user.id === userId);
    const followingUser = users.find(user => user.id === followerId);

    await followedUser.addFollowers(followingUser);

    // get all followers retrieving only id
    const userFollowers = await followedUser.getFollowers({
      attributes: ['id']
    });

    // we use toJSON to convert the sequelize model instance to json object
    // so we can add the followers property to the followedUser object
    // to be returned
    followedUser = followedUser.toJSON();
    followedUser.followers = userFollowers.map(item => item.id);

    // return the followed user
    return res.status(201).send({
      status: 'success',
      data: followedUser
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

/**
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} response object
 */
export const unfollowUser = async (req, res) => {
  const { userId } = req.params;

  // req.user is available after passport authenticates user
  const followerId = req.user.id;

  try {
    // use one query to get the two users
    // fetching id only because we don't need other fields for the operation here
    const users = await User.findAll({
      where: { id: { [Op.in]: [userId, followerId] } },
      attributes: ['id']
    });

    if (users.length < 2) {
      return res.status(404).send({
        status: 'fail',
        message: 'account(s) not found'
      });
    }

    let followedUser = users.find(user => user.id === userId);
    const followingUser = users.find(user => user.id === followerId);

    await followedUser.removeFollowers(followingUser);

    // get all followers retrieving only id
    const userFollowers = await followedUser.getFollowers({
      attributes: ['id']
    });

    // we use toJSON to convert the sequelize model instance to json object
    // so we can add the followers property to the followedUser object
    // to be returned
    followedUser = followedUser.toJSON();
    followedUser.followers = userFollowers.map(item => item.id);

    // return the followed user
    return res.status(201).send({
      status: 'success',
      data: followedUser
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

/**
* @export
* @function resetPasswordVerification
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
export const resetPasswordVerification = async (req, res) => {
  const { body: { email } } = req;
  try {
    const foundUser = await User.findOne({ where: { email: { [Op.eq]: email } } });

    if (!foundUser) {
      return res.status(404).send({
        status: 'fail',
        message: 'User not found,Provide correct email address',
      });
    }
    const token = signToken(
      {
        email
      },
      '10m'
    );

    const {
      username
    } = foundUser;

    if (process.env.NODE_ENV === 'production') {
      try {
        await resetPasswordVerificationMail(username, foundUser.email, token);
      } catch (error) {
        logger.debug('Email Error::', error);
      }
    }

    return res.status(200).send({
      status: 'success',
      data: {
        message: `A confirmation email has been sent to ${foundUser.email}. Click on the confirmation button to verify the account`,
        link: `${process.env.REACT_ENDPOINT}/passwordreset#token=${token}`
      },
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

/**
* @export
* @function resetPassword
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
export const resetPassword = async (req, res) => {
  try {
    const { params: { token }, body: { password } } = req;
    const { email } = verifyToken(token);

    // Check if the user exists in the database
    const foundUser = await User.findOne({ where: { email: { [Op.eq]: email } } });

    if (!foundUser) {
      return res.status(404).send({
        status: 'fail',
        message: 'User not found,Provide correct email address',
      });
    }

    const hashedPassword = await User.hashPassword(password);

    const updatedUser = await foundUser.update(
      { password: hashedPassword, ...(!foundUser.isVerified && { isVerified: true }) },
      {
        where: { email: { [Op.eq]: email } },
        returning: true,
        plain: true
      }
    );

    return res.status(200).send({
      status: 'success',
      data: {
        userId: updatedUser.id,
        email,
        message: 'Password update Successful. You can now login'
      }
    });
  } catch (e) {
    if (e.name === 'TokenExpiredError' || e.name === 'JsonWebTokenError') {
      return res.status(401).send({
        status: 'fail',
        message: 'Link has expired. Kindly re-initiate password change.'
      });
    }
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

export const changeRole = async ({ body: { id, role: proposedRole } }, res) => {
  try {
    const user = await User.update(
      { role: proposedRole },
      { returning: true, where: { id: { [Op.eq]: id } } }
    );

    if (user[0] === 0) {
      return res.status(404).send({
        status: 'fail',
        message: 'no user found with that id'
      });
    }

    const [, [{ username, role: assignedRole }]] = user;

    return res.status(200).send({
      status: 'success',
      data: { id, username, assignedRole }
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'internal server error occured'
    });
  }
};

export const listAuthors = async (req, res) => {
  try {
    const users = await User.findAndCountAll({
      attributes: { exclude: ['password', 'email', 'isVerified', 'updatedAt'] },
      include: [{
        model: Article,
        as: 'userArticles',
        attributes: ['id', 'slug', 'description'],
        required: true
      }]
    });


    const usersWithCount = users.rows.map((user) => {
      user = user.toJSON();
      user.articlesWritten = user.userArticles.length;
      return user;
    });

    delete users.rows;
    users.users = usersWithCount;
    users.count = users.users.length;

    return res.status(200).send({
      status: 'success',
      data: users
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'internal server error occured'
    });
  }
};

export const getUser = async ({ user: { role }, params: { id } }, res) => {
  if (role !== 'admin' && role !== 'super-admin') {
    return res.status(403).send({
      status: 'fail',
      message: 'You\'re not an admin'
    });
  }
  try {
    let user = await User.findOne({
      where: { id: { [Op.eq]: id } },
      attributes: { exclude: ['password'] },
      include: [{
        model: Article,
        as: 'userArticles',
        attributes: ['id']
      }]
    });

    if (user === null) {
      return res.status(404).send({
        status: 'fail',
        message: 'no user with that id'
      });
    }
    user = user.toJSON();
    user.articlesWritten = user.userArticles.length;

    return res.status(200).send({
      status: 'success',
      data: user
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'internal server error occured'
    });
  }
};

export const deleteUser = async ({ user: { role }, params: { id } }, res) => {
  if (role !== 'admin' && role !== 'super-admin') {
    return res.status(403).send({
      status: 'fail',
      message: 'You\'re not an admin'
    });
  }
  try {
    const user = await User.destroy({ where: { id: { [Op.eq]: id } }, force: true });

    if (!user) {
      return res.status(404).send({
        status: 'fail',
        message: 'no user with that id'
      });
    }

    return res.status(200).send({
      status: 'success',
      data: { id, message: 'user deleted' }
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'internal server error occured'
    });
  }
};

export const unsubscribeMail = async ({ params: { id } }, res) => {
  try {
    await User.update(
      { notifications: false },
      { returning: true, where: { id: { [Op.eq]: id } } }
    );

    return res.status(200).send({
      status: 'success',
      message: 'Successfully unsubscribed from email list'
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'internal server error occured'
    });
  }
};

/**
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} response object
 */
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'role', 'isVerified'] }
  });

  if (!user) {
    return res.status(404).send({
      status: 'fail',
      message: 'User not found'
    });
  }

  const userData = user.toJSON();
  const userFollowers = await user.getFollowers({ attributes: ['id', 'firstname', 'lastname', 'imageUrl'] });
  const userFollowing = await user.getFollowing({ attributes: ['id', 'firstname', 'lastname', 'imageUrl'] });

  // pluck only id, firstname only from user data
  userData.followers = userFollowers.map(({ id, firstname, imageUrl }) => ({ id, firstname, imageUrl }));
  userData.following = userFollowing.map(({ id, firstname, imageUrl }) => ({ id, firstname, imageUrl }));

  userData.publishedArticles = await user.getUserArticles();

  return res.status(200).send({
    status: 'success',
    data: userData
  });
};

/**
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} response object
 */
export const uploadProfileImage = async (req, res) => {
  const { id: userId } = req.user;

  try {
    const storage = multer.diskStorage({
      destination(req, file, cb) {
        cb(null, 'uploads/');
      },
      filename(req, file, cb) {
        cb(null, file.originalname);
      }
    });

    // user multer to store the image in the local /uploads folder
    const upload = multer({ storage }).single('profile-picture');
    await upload(req, res, (error) => {
      if (error) {
        return res.status(500).send({
          status: 'error',
          message: 'There was an error with the upload. Try again',
          error
        });
      }

      // Upload the saved file to cloudinary
      const cloudinary = _cloudinary.v2;

      const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUD_NAME } = process.env;
      cloudinary.config({
        cloud_name: CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
      });

      const { path } = req.file;
      const uniqueFilename = new Date().toISOString();

      cloudinary.uploader.upload(
        path,
        { public_id: `profiles/${uniqueFilename}`, tags: 'author-haven profile pictures' },
        async (err, image) => {
          if (err) {
            return res.status(500).send({
              status: 'error',
              message: 'There was an error with your request. Try again',
              error
            });
          }

          // remove file from server
          fs.unlinkSync(path);

          // update the user details
          const user = await User.findByPk(userId);
          const { url: imageUrl } = image || {};

          const updatedUser = await user.update({ imageUrl });
          const { id, email, firstname } = updatedUser.toJSON();

          return res.status(200).send({
            status: 'success',
            data: {
              id, email, firstname, imageUrl
            }
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error',
      error
    });
  }
};

/**
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} response object
 */
export const updateUserProfile = async (req, res) => {
  const { params: { userId }, body } = req;
  const { user: { id: authenticatedUserId } } = req;

  if (userId !== authenticatedUserId) {
    return res.status(400).send({
      status: 'fail',
      message: 'Wrong User. You cannot perform this operation'
    });
  }

  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'role', 'isVerified'] }
    });

    const updatedUser = await user.update(body);

    const userData = updatedUser.toJSON();
    const userFollowers = await user.getFollowers({ attributes: ['id', 'firstname', 'lastname', 'imageUrl'] });
    const userFollowing = await user.getFollowing({ attributes: ['id', 'firstname', 'lastname', 'imageUrl'] });

    // pluck only id, firstname only from user data
    userData.followers = userFollowers.map(({ id, firstname, imageUrl }) => ({ id, firstname, imageUrl }));
    userData.following = userFollowing.map(({ id, firstname, imageUrl }) => ({ id, firstname, imageUrl }));

    userData.publishedArticles = await user.getUserArticles();

    return res.status(200).send({
      status: 'success',
      data: userData
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
