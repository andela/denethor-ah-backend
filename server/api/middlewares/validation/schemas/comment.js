import Joi from 'joi';

const articleId = Joi.string().trim().min(1).required();
const commentId = Joi.string().trim().min(1).required();
const commentBody = Joi.string().trim().min(1).max(140)
  .required();

export const newCommentSchema = { commentBody, articleId };
export const updateCommentSchema = { commentBody, articleId, commentId };
export const deleteCommentRequestSchema = { articleId, commentId };
