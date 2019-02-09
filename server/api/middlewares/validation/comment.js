import Joi from 'joi';
import commentSchema from './schemas/comment';

export const newCommentValidator = (
  { params: { articleId }, body: { commentBody } }, res, next
) => {
  const payload = { articleId, commentBody };
  Joi.validate(payload, commentSchema)
    .then(() => {
      next();
    })
    .catch((error) => {
      res.status(422).send({ status: 'fail', message: error });
    });
};
