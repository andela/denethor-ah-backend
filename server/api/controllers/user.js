import Sequelize from 'sequelize';

import { signToken } from '../helpers/tokenization/tokenize';
import { User } from '../../models';
import sendVerificationMail from '../helpers/mailer/mailer';

const { Op } = Sequelize;

/**
* @export
* @function registerUser
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
* @memberof Tokenize
*/
const registerUser = async (req, res) => {
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

    await sendVerificationMail(username, email, createdUser.id);

    return res.status(200).send({
      status: 'success',
      data: {
        user: `A confirmation email has been sent to ${email}. Click on the confirmation button to verify the account`,
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

const verifyUser = async (req, res) => {
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

export { registerUser, verifyUser };
