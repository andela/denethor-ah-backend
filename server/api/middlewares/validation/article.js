import Joi from 'joi';
import { newArticleSchema } from './schemas/article';

export const newArticleValidator = (req, res, next) => {
  Joi.validate(req.body, newArticleSchema)
    .then(() => {
      next();
    })
    .catch((error) => {
      res.status(422).send({ error });
    });
};
