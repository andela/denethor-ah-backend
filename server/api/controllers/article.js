import Sequelize from 'sequelize';
import { createLogger, format, transports } from 'winston';
import { Article, LikeDislike, Tag } from '../../models';

const { Op } = Sequelize;

const logger = createLogger({
  level: 'debug',
  format: format.simple(),
  transports: [new transports.Console()]
});


const formatTags = (newArticleTags) => {
  return newArticleTags.split(',').map(word => word.replace(/(\s+)/g, '').trim());
};

/**
*
* @function insertTag
* @param {Array} tagArray - tags received
* @returns {Object} JSON object (JSend format)
*/
const insertTag = async (tagArray) => {
  let insertedTags = [];
  try {
    insertedTags = tagArray.map(async (tagText) => {
      const newTag = await Tag.findOrCreate({ where: { tagText: { [Op.eq]: tagText } }, defaults: { tagText } });
      return newTag;
    });
    return Promise.all(insertedTags);
  } catch (error) {
    logger.debug('Tag already present in database');
  }
};

/**
* @export
* @function createArticle
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
export const createArticle = async (req, res) => {
  try { 
    const { body: { slug, description, body, references, categoryId } , user: { id: userId } } = req;
    const newArticle = await Article.create({ slug, description, body, references, categoryId, authorId: userId });

    if (req.body.tags) {
      const newArticleTags = req.body.tags;
      const tagArray = formatTags(newArticleTags);
      const newTags = await insertTag(tagArray);
      newTags.forEach(async (tag) => {
        await newArticle.addTags(tag[0].id);
      });
    }

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
