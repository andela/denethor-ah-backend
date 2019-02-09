import Joi from 'joi';

const articleId = Joi.string().trim().min(1).required();
const commentBody = Joi.string().trim().min(1).max(140)
  .required();

export default { commentBody, articleId };
