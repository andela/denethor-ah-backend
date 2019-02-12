"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeRole = exports.upgradeToAdmin = exports.resetPassword = exports.resetPasswordVerification = exports.followUser = exports.loginUser = exports.logout = exports.socialLogin = exports.verifyUser = exports.registerUser = void 0;

var _dotenv = _interopRequireDefault(require("dotenv"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _winston = require("winston");

var _tokenize = require("../helpers/tokenization/tokenize");

var _models = require("../../models");

var _mailer = require("../helpers/mailer/mailer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv.default.config();

const logger = (0, _winston.createLogger)({
  level: 'debug',
  format: _winston.format.simple(),
  transports: [new _winston.transports.Console()]
});
const {
  Op
} = _sequelize.default;
/**
* @export
* @function registerUser
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/

const registerUser = async (req, res) => {
  const {
    firstname,
    lastname,
    username,
    email,
    password
  } = req.body;

  try {
    const foundUser = await _models.User.findOne({
      where: {
        email: {
          [Op.eq]: email
        }
      }
    });

    if (foundUser) {
      return res.status(409).send({
        status: 'fail',
        data: {
          email: 'User with this email already exist.'
        }
      });
    }

    const createdUser = await _models.User.create({
      firstname,
      lastname,
      username,
      email,
      password
    });
    const link = `${req.protocol}://${req.headers.host}/api/users/${createdUser.id}/verify`;

    if (process.env.NODE_ENV === 'production') {
      try {
        await (0, _mailer.sendVerificationMail)(username, email, link);
      } catch (error) {
        logger.debug('Email Error::', error);
      }
    }

    return res.status(201).send({
      status: 'success',
      data: {
        message: `A confirmation email has been sent to ${email}. Click on the confirmation button to verify the account`,
        link
      }
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


exports.registerUser = registerUser;

const verifyUser = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const unverifiedUser = await _models.User.findByPk(id);

    if (!unverifiedUser) {
      return res.status(404).send({
        status: 'fail',
        data: {
          message: 'user does not exist'
        }
      });
    }

    if (unverifiedUser.isVerified) {
      return res.status(400).send({
        status: 'fail',
        message: 'User is already verified'
      });
    }

    const {
      email,
      username,
      role
    } = await unverifiedUser.update({
      isVerified: true
    }, {
      returning: true,
      plain: true
    });
    const token = (0, _tokenize.signToken)({
      id,
      email,
      role
    });
    return res.status(200).send({
      status: 'success',
      data: {
        message: 'Verification successful. You\'re all set!',
        user: {
          username,
          email,
          token,
          role
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

exports.verifyUser = verifyUser;

const socialLogin = async (req, res) => {
  const {
    firstname,
    lastname,
    username,
    email,
    password,
    imageUrl,
    role
  } = req.user;

  try {
    const {
      id
    } = await _models.User.findOrCreate({
      where: {
        email
      },
      defaults: {
        firstname,
        lastname,
        username,
        password,
        imageUrl,
        isVerified: true,
        role
      }
    });
    const token = (0, _tokenize.signToken)({
      id,
      email,
      role
    });
    return res.status(200).send({
      status: 'success',
      data: {
        message: 'login successful',
        user: {
          username,
          email,
          role
        },
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

exports.socialLogin = socialLogin;

const logout = (req, res) => {
  req.session.destroy(err => {
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


exports.logout = logout;

const loginUser = async (req, res) => {
  const userCredentials = req.body;
  const {
    email,
    password
  } = userCredentials; // Check if the user exists in the database

  const foundUser = await _models.User.findOne({
    where: {
      email: {
        [Op.eq]: email
      }
    }
  });

  if (!foundUser) {
    return res.status(401).send({
      status: 'fail',
      message: 'Provide correct login credentials'
    });
  }

  if (!foundUser.isVerified) {
    return res.status(403).send({
      status: 'fail',
      message: 'Email not verified'
    });
  }

  if (!_models.User.passwordMatch(foundUser.password, password)) {
    return res.status(401).send({
      status: 'fail',
      message: 'Provide correct login credentials'
    });
  }

  const {
    id,
    role
  } = foundUser;
  const token = (0, _tokenize.signToken)({
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


exports.loginUser = loginUser;

const followUser = async (req, res) => {
  const {
    userId
  } = req.params; // req.user is available after password authenticates user

  const followerId = req.user.id;

  try {
    let followedUser = await _models.User.findByPk(userId);
    const followingUser = await _models.User.findByPk(followerId);

    if (!followedUser || !followingUser) {
      return res.status(404).send({
        status: 'fail',
        message: 'account(s) not found'
      });
    }

    await followedUser.addFollowers(followingUser); // get all followers retrieving only id

    const userFollowers = await followedUser.getFollowers({
      attributes: ['id']
    }); // we use toJSON to convert the sequelize model instance to json object
    // so we can add the followers property to the followedUser object
    // to be returned

    followedUser = followedUser.toJSON();
    followedUser.followers = userFollowers.map(item => item.id); // return the followed user

    return res.status(201).send({
      status: 'success',
      data: followedUser
    });
  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

exports.followUser = followUser;

const resetPasswordVerification = async (req, res) => {
  const {
    body: {
      email
    }
  } = req;

  try {
    const foundUser = await _models.User.findOne({
      where: {
        email: {
          [Op.eq]: email
        }
      }
    });

    if (!foundUser) {
      return res.status(404).send({
        status: 'fail',
        message: 'User not found,Provide correct email address'
      });
    }

    const token = (0, _tokenize.signToken)({
      email
    }, '10m');
    const {
      username
    } = foundUser;

    if (process.env.NODE_ENV === 'production') {
      try {
        await (0, _mailer.resetPasswordVerificationMail)(username, foundUser.email, token);
      } catch (error) {
        logger.debug('Email Error::', error);
      }
    }

    return res.status(200).send({
      status: 'success',
      data: {
        message: `A confirmation email has been sent to ${foundUser.email}. Click on the confirmation button to verify the account`,
        link: `${req.protocol}://${req.headers.host}/api/users/resetPassword/${token}`
      }
    });
  } catch (e) {
    res.status(500).send({
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


exports.resetPasswordVerification = resetPasswordVerification;

const resetPassword = async (req, res) => {
  try {
    const {
      params: {
        token
      },
      body: {
        password
      }
    } = req;
    const {
      email
    } = (0, _tokenize.verifyToken)(token); // Check if the user exists in the database

    const foundUser = await _models.User.findOne({
      where: {
        email: {
          [Op.eq]: email
        }
      }
    });

    if (!foundUser) {
      return res.status(404).send({
        status: 'fail',
        message: 'User not found,Provide correct email address'
      });
    }

    const updatedUser = await foundUser.update({
      password
    }, {
      where: {
        email: {
          [Op.eq]: email
        }
      },
      returning: true,
      plain: true
    });
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

    res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

exports.resetPassword = resetPassword;

const upgradeToAdmin = async ({
  user: {
    id
  },
  body: {
    pass
  }
}, res) => {
  if (pass !== process.env.ADMIN_PASS) {
    return res.status(403).send({
      status: 'fail',
      message: 'wrong pass'
    });
  }

  try {
    const [, [{
      username,
      role: assignedRole
    }]] = await _models.User.update({
      role: 'admin'
    }, {
      returning: true,
      where: {
        id: {
          [Op.eq]: id
        }
      }
    });
    res.status(200).send({
      status: 'success',
      data: {
        id,
        username,
        assignedRole
      }
    });
  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

exports.upgradeToAdmin = upgradeToAdmin;

const changeRole = async ({
  body: {
    id,
    role: proposedRole
  }
}, res) => {
  try {
    const user = await _models.User.update({
      role: proposedRole
    }, {
      returning: true,
      where: {
        id: {
          [Op.eq]: id
        }
      }
    });

    if (user[0] === 0) {
      return res.status(404).send({
        status: 'fail',
        message: 'no user found with that id'
      });
    }

    const [, [{
      username,
      role: assignedRole
    }]] = user;
    res.status(200).send({
      status: 'success',
      data: {
        id,
        username,
        assignedRole
      }
    });
  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: 'internal server error occured'
    });
  }
};

exports.changeRole = changeRole;