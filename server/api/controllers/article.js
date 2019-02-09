import Sequelize from 'sequelize';

import { Article, LikeDislike } from '../../models';

const { Op } = Sequelize;

export const createArticle = async (req, res) => {
  try {
    const { body: newArticleData, user: { id: userId } } = req;
    newArticleData.authorId = userId;
    const newArticle = await Article.create(newArticleData);
    return res.status(201).send({ status: 'Success', data: newArticle });
  } catch (error) {
    return res.status(502).send({ status: 'Error', message: 'OOPS! an error occurred while trying to create your article, you do not seem to be logged in or signed up, log in and try again!' });
  }
};

/**
* @export
* @function likeArticle
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
export const likeArticle = async (req, res) => {
  try {
    const { params: { id: articleId }, user: { id: userId } } = req;

    const foundImpression = await LikeDislike.findOne({
      where: {
        articleId: { [Op.eq]: articleId },
        userId: { [Op.eq]: userId }
      }
    });

    if (!foundImpression) {
      const newImpression = await LikeDislike.create({
        articleId,
        userId,
        like: true
      });
      return res.status(200).send({
        status: 'success',
        data: {
          message: 'You liked this Article!',
          impression: newImpression
        }
      });
    }

    if (foundImpression && foundImpression.like) {
      const updatedImpression = await foundImpression.update({ like: false },
        { returning: true, plain: true });
      return res.status(200).send({
        status: 'success',
        data: {
          message: 'You unliked this Article!',
          impression: updatedImpression
        }
      });
    }

    if (foundImpression && !foundImpression.like) {
      const updatedImpression = await foundImpression.update({ like: true, dislike: false },
        { returning: true, plain: true });
      return res.status(200).send({
        status: 'success',
        data: {
          message: 'You liked this Article!',
          impression: updatedImpression
        }
      });
    }
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

/**
* @export
* @function dislikeArticle
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
export const dislikeArticle = async (req, res) => {
  try {
    const { params: { id: articleId }, user: { id: userId } } = req;

    const foundImpression = await LikeDislike.findOne({
      where: {
        articleId: { [Op.eq]: articleId },
        userId: { [Op.eq]: userId }
      }
    });

    if (!foundImpression) {
      const newImpression = await LikeDislike.create({
        articleId,
        userId,
        dislike: true
      });
      return res.status(200).send({
        status: 'success',
        data: {
          message: 'You disliked this Article!',
          impression: newImpression
        }
      });
    }

    if (foundImpression && foundImpression.dislike) {
      const updatedImpression = await foundImpression.update({ dislike: false },
        { returning: true, plain: true });
      return res.status(200).send({
        status: 'success',
        data: {
          message: 'You un-disliked this Article!',
          impression: updatedImpression
        }
      });
    }

    if (foundImpression && !foundImpression.dislike) {
      const updatedImpression = await foundImpression.update({ like: false, dislike: true },
        { returning: true, plain: true });
      return res.status(200).send({
        status: 'success',
        data: {
          message: 'You disliked this Article!',
          impression: updatedImpression
        }
      });
    }
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};
