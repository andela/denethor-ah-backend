import Joi from 'joi';

const firstname = Joi.string().trim().strict().min(3)
  .required();

const lastname = Joi.string().trim().strict().min(3)
  .required();

const username = Joi.string().trim().alphanum().min(3)
  .max(30)
  .required();

const email = Joi.string().trim().strict().min(10)
  .max(100)
  .email()
  .required();

const password = Joi.string().trim().strict().alphanum()
  .min(8)
  .max(40)
  .required();

const registrationSchema = {
  firstname,
  lastname,
  username,
  email,
  password,
};

export default registrationSchema;
