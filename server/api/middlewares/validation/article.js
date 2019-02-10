import Joi from 'joi';
import { newArticleSchema, createHighlightSchema, ratingSchema } from './schemas/article';

/**
* @export
* @function newArticleValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const newArticleValidator = (req, res, next) => {
  Joi.validate(req.body, newArticleSchema)
    .then(() => {
      next();
    })
    .catch((error) => {
      res.status(422).send({ error });
    });
};

/**
* @export
* @function createHighlightValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const createHighlightValidator = (req, res, next) => {
  Joi.validate(req.body, createHighlightSchema)
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
* @function ratingValidator
* @param {Object} req - request received
* @param {Object} res - response object
* @param {Object} next - next object
* @returns {Object} next object
*/
export const ratingValidator = (req, res, next) => {
  Joi.validate(req.body, ratingSchema)
    .then(() => next())
    .catch(error => res.status(422).send({
      status: 'fail',
      data: {
        input: error.details[0].message,
      }
    }));
};
