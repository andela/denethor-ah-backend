import Joi from 'joi';

const title = Joi.string().min(10).required();
const updatedTitle = Joi.string().min(10);
const description = Joi.string().min(10).required();
const updateDescription = Joi.string().min(10);
const body = Joi.string().min(20).required();
const updateBody = Joi.string().min(20);
const references = Joi.array().items(Joi.string());
const categoryId = Joi.number().required();
const updateCategoryId = Joi.number().integer().min(1);
const tags = Joi.string();
const highlight = Joi.string().trim().min(1).required();
const comment = Joi.string().trim().min(1).required();
const rating = Joi.number().integer().min(1).max(5)
  .required();

export const newArticleSchema = {
  title,
  description,
  body,
  references,
  categoryId,
  tags
};
export const updateArticleSchema = {
  title: updatedTitle,
  description: updateDescription,
  body: updateBody,
  references,
  categoryId: updateCategoryId,
  tags
};

export const createHighlightSchema = { highlight, comment };
export const ratingSchema = { rating };
