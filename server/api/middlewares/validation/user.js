import Joi from 'joi';
import {
  registrationRequestSchema, loginRequestSchema,
  forgotPasswordSchema, changePasswordSchema,
  profileUpdateSchema, resetPasswordSchema
} from './schemas/user';

/**
* @export
* @function registrationValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const registrationValidation = (req, res, next) => {
  Joi.validate(req.body, registrationRequestSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};

/**
* @export
* @function loginValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const loginValidation = (req, res, next) => {
  Joi.validate(req.body, loginRequestSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};

/**
* @export
* @function requestPasswordValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const emailValidation = ({ body }, res, next) => {
  Joi.validate(body, forgotPasswordSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};

/**
* @export
* @function requestPasswordValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const changePasswordValidation = ({ body }, res, next) => {
  let passwordSchema;
  if (body.oldPassword || body.newPassword) {
    passwordSchema = resetPasswordSchema;
  }
  else {
    passwordSchema = changePasswordSchema;
  }
  Joi.validate(body, passwordSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};


/**
* @export
* @function requestPasswordValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const changeRoleValidation = (
  { user: { role }, body: { role: proposedRole } }, res, next
) => {
  if (role !== 'super-admin') {
    return res.status(401).send({
      status: 'fail',
      message: 'only super-admin can change the role of others'
    });
  }

  const availableRoles = ['admin', 'author'];

  if (!availableRoles.includes(proposedRole)) {
    return res.status(422).send({
      status: 'fail',
      message: 'not a valid role'
    });
  }

  next();
};

/**
* @export
* @function profileUpdateValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const profileUpdateValidation = (req, res, next) => {
  Joi.validate(req.body, profileUpdateSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};
