import Joi from 'joi';

const highlight = Joi.string().trim().min(1).required();
const comment = Joi.string().trim().min(1).required();
const highlightId = Joi.string().trim().min(1).required();
const articleId = Joi.string().trim().min(1).required();

export const createHighlightSchema = { articleId, highlight, comment };

export const getHighlightsSchema = { articleId };

export const editHighlightSchema = { articleId, highlightId, comment };

export const deleteHighlightSchema = { articleId, highlightId };
