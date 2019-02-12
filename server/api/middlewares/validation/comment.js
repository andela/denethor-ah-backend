import Joi from 'joi';
import { newCommentSchema, updateCommentSchema } from './schemas/comment';

export const newCommentValidator = (
  { params: { articleId }, body: { commentBody } }, res, next
) => {
  const payload = { articleId, commentBody };
  Joi.validate(payload, newCommentSchema)
    .then(() => {
      next();
    })
    .catch((error) => {
      res.status(422).send({ status: 'fail', message: error });
    });
};

export const updateCommentValidator = (
  { params: { articleId, commentId }, body: { commentBody } }, res, next
) => {
  const payload = { articleId, commentId, commentBody };
  Joi.validate(payload, updateCommentSchema)
    .then(() => {
      next();
    })
    .catch((error) => {
      res.status(422).send({ status: 'fail', message: error });
    });
};
