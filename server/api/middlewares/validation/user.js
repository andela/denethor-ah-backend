import Joi from 'joi';

import registrationRequestSchema from './schemas/user';

/**
* @export
* @function registrationValidation
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
const registrationValidation = (req, res, next) => {
  Joi.validate(req.body, registrationRequestSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};

export default registrationValidation;
