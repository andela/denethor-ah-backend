import Joi from 'joi';

const slug = Joi.string().min(5).required();
const description = Joi.string().min(10).required();
const body = Joi.string().min(20).required();
const references = Joi.array().items(Joi.string());
const categoryId = Joi.number().required();
const tags = Joi.string();
const highlight = Joi.string().trim().min(1).required();
const comment = Joi.string().trim().min(1).required();

export const newArticleSchema = {
  slug,
  description,
  body,
  references,
  categoryId,
  tags
};

export const createHighlightSchema = { highlight, comment };
