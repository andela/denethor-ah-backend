import { Comment } from '../../models';

export const postComment = async ({ params: { articleId }, body: { commentBody } }, res) => {
  try {
    const newComment = await Comment.create({ commentBody, articleId });
    return res.status(201).send({ status: 'success', data: newComment });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Error saving comment',
      data: error
    });
  }
};
