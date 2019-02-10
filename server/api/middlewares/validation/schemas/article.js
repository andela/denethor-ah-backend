import Joi from 'joi';

const description = Joi.string().min(10).required();
const body = Joi.string().min(20).required();
const authorId = Joi.string();
const references = Joi.array().items(Joi.string());
const categoryId = Joi.number().required();
const tags = Joi.string();

export const newArticleSchema = {
  description,
  body,
  authorId,
  references,
  categoryId,
  tags
};
