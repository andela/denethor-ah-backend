import Joi from 'joi';

const slug = Joi.string().min(5).required();
const description = Joi.string().min(10).required();
const body = Joi.string().min(20).required();
const authorId = Joi.string();
const references = Joi.array().items(Joi.string());
const categoryId = Joi.number().required();

export const newArticleSchema = {
  slug,
  description,
  body,
  authorId,
  references,
  categoryId,
};
