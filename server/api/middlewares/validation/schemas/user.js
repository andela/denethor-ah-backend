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

const registrationRequestSchema = {
  firstname,
  lastname,
  username,
  email,
  password,
};

// for profile update the schema options are different
// they are all optional and not required
const firstnameUpate = Joi.string().trim().strict().min(3);

const lastnameUpate = Joi.string().trim().strict().min(3);

const usernameUpate = Joi.string().trim().alphanum().min(3)
  .max(30);

const emailUpate = Joi.string().trim().strict().min(10)
  .max(100)
  .email();

const bioUpdate = Joi.string().trim().strict()
  .min(10)
  .max(200);

const profileUpdateSchema = {
  firstname: firstnameUpate,
  lastname: lastnameUpate,
  username: usernameUpate,
  email: emailUpate,
  bio: bioUpdate
};

const loginRequestSchema = {
  email,
  password,
};

const resetPasswordSchema = {
  email
};

const changePasswordSchema = {
  password
};

export {
  loginRequestSchema, registrationRequestSchema, resetPasswordSchema, changePasswordSchema, profileUpdateSchema
};
