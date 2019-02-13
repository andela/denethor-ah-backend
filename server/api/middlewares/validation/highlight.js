import Joi from 'joi';
import {
  createHighlightSchema, getHighlightsSchema, editHighlightSchema, deleteHighlightSchema
} from './schemas/highlight';

/**
* @export
* @function createHighlightValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const createHighlightValidator = (req, res, next) => {
  const { params: { articleId }, body: { highlight, comment } } = req;

  Joi.validate({ articleId, highlight, comment }, createHighlightSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};

/**
* @export
* @function getHighlightsValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const getHighlightsValidator = (req, res, next) => {
  const { params: { articleId } } = req;

  Joi.validate({ articleId }, getHighlightsSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};

/**
* @export
* @function editHighlightValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const editHighlightValidator = (req, res, next) => {
  const { params: { articleId, highlightId }, body: { comment } } = req;

  Joi.validate({ articleId, highlightId, comment }, editHighlightSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};

/**
* @export
* @function deleteHighlightValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const deleteHighlightValidator = (req, res, next) => {
  const { params: { articleId, highlightId } } = req;

  Joi.validate({ articleId, highlightId }, deleteHighlightSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};
