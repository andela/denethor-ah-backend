import Joi from 'joi';

import { registrationRequestSchema, loginRequestSchema } from './schemas/user';

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
