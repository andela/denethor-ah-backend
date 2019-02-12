import {
  Comment, Article, Sequelize
} from '../../models';

const { Op } = Sequelize;

export const postComment = async (req, res) => {
  const { params: { articleId }, body: { commentBody }, user: { id: userId } } = req;
  try {
    const newComment = await Comment.create({ commentBody, articleId, userId });
    return res.status(201).send({ status: 'success', data: newComment });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Error saving comment',
      data: error
    });
  }
};

export const updateComment = async (req, res) => {
  const { params: { articleId, commentId }, body: { commentBody } } = req;
  try {
    const foundArticle = await Article.findByPk(articleId);
    if (!foundArticle) {
      res.status(404).send({
        status: 'fail',
        message: 'Article not found'
      });
    }
    const foundComments = await foundArticle.getComments({ where: { id: { [Op.eq]: commentId } } });
    const foundComment = foundComments[0];

    if (!foundComment) {
      res.status(404).send({
        status: 'fail',
        message: 'Comment not found under this article'
      });
    }
    // update the comment
    const updatedComment = await foundComment.update({ commentBody },
      { returning: true, plain: true });

    // save the old version of the comment in the comment history
    await updatedComment.createCommentHistory({
      commentId: foundComment.id,
      commentBody: foundComment.commentBody
    });

    const oldComments = await updatedComment.getCommentHistories();
    const comment = updatedComment.toJSON();
    comment.oldComments = oldComments;

    res.status(200).send({
      status: 'success',
      message: 'Comment updated',
      data: comment
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Error updating comment'
    });
  }
};
