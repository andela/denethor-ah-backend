import { omit } from 'lodash';
import {
  Comment,
  User,
  Article,
  LikeComment,
  Sequelize
} from '../../models';

import informBookmarkers from '../helpers/notification/bookmarkers';

const {
  Op
} = Sequelize;

export const postComment = async (req, res) => {
  const {
    params: {
      articleId
    },
    body: {
      commentBody
    },
    user: {
      id: userId
    }
  } = req;
  try {
    let newComment = await Comment.create({
      commentBody,
      articleId,
      userId
    });
    informBookmarkers(articleId, commentBody, userId);

    const comments = await Comment.findAll({
      where: {
        articleId: {
          [Op.eq]: articleId
        }
      },
      order: [['updatedAt', 'DESC']]
    });

    let allComments = comments.map(async (comment) => {
      const user = await User.findById(comment.userId, {
        attributes: {
          exclude: ['id', 'username', 'email', 'password',
            'role', 'bio', 'imageUrl', 'verified', 'createdAt', 'updatedAt']
        },
      });

      const editedComment = omit(comment.toJSON(), ['userId']);
      editedComment.user = user.toJSON();
      return editedComment;
    });

    allComments = await Promise.all(allComments);
    newComment = newComment.toJSON();
    newComment.comments = allComments;

    return res.status(201).send({
      status: 'success',
      data: newComment.comments
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Error saving comment',
      data: error
    });
  }
};

export const updateComment = async (req, res) => {
  const {
    params: {
      articleId,
      commentId
    },
    body: {
      commentBody
    }
  } = req;
  try {
    const foundArticle = await Article.findByPk(articleId);
    if (!foundArticle) {
      return res.status(404).send({
        status: 'fail',
        message: 'Article not found'
      });
    }
    const foundComments = await foundArticle.getComments({
      where: {
        id: {
          [Op.eq]: commentId
        }
      }
    });
    const foundComment = foundComments[0];

    if (!foundComment) {
      return res.status(404).send({
        status: 'fail',
        message: 'Comment not found under this article'
      });
    }

    // save the old version of the comment in the comment history
    await foundComment.createCommentHistory({
      commentId: foundComment.id,
      commentBody: foundComment.commentBody
    });

    // update the comment
    const updatedComment = await foundComment.update({
      commentBody
    }, {
      returning: true,
      plain: true
    });

    const oldComments = await updatedComment.getCommentHistories();
    const comment = updatedComment.toJSON();
    comment.oldComments = oldComments;

    return res.status(200).send({
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

/**
 * @export
 * @function deleteComment
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const deleteComment = async (req, res) => {
  try {
    const {
      params: {
        articleId,
        commentId
      },
      user: {
        id: userId,
        role
      }
    } = req;
    const foundComment = await Comment.findOne({
      where: {
        id: {
          [Op.eq]: commentId
        },
        articleId: {
          [Op.eq]: articleId
        },
      }
    });

    if (!foundComment) {
      return res.status(404).send({
        status: 'fail',
        data: {
          message: 'No comment was found',
        }
      });
    }

    if (role !== 'admin' && foundComment.userId !== userId) {
      return res.status(401).send({
        status: 'fail',
        data: {
          message: 'Not authorized'
        }
      });
    }

    await foundComment.destroy();

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'Comment was deleted successfully',
        comment: null
      }
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal Server error occured'
    });
  }
};

/**
 * @export
 * @function likeComment
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const likeComment = async (req, res) => {
  try {
    const {
      params: {
        commentId
      },
      user: {
        id: userId
      }
    } = req;

    await LikeComment.findOrCreate({
      where: {
        commentId,
        userId
      }
    }).spread((like, created) => {
      if (created) {
        return res.status(201).send({
          status: 'success',
          message: 'You liked this comment!',
        });
      }
      like.destroy();
      return res.status(200).send({
        status: 'success',
        message: 'You unliked this comment!'
      });
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal Server error occured'
    });
  }
};
