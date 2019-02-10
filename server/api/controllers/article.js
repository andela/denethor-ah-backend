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
* @function getReadTime
* @param {String} articleBody - article.body
* @returns {String} - Read Time eg '2 minutes'
*/
export const getReadTime = (articleBody) => {
  // Read time is based on the average reading speed of an adult (roughly 275 WPM).
  // We take the total word count of a post and translate it into minutes.
  // Then, we add 12 seconds for each inline image.
  // TIME = DISTANCE / SPEED
  const words = articleBody.split(' ');
  const wordCount = words.length;

  const readTimeInMinutes = wordCount / 275;
  let readTimeInSeconds = readTimeInMinutes * 60;

  const imagesFound = articleBody.split('<img'); // search for image tags

  imagesFound.forEach(() => {
    readTimeInSeconds += 12; // add 12 seconds for each inline image
  });

  let readTime = Math.ceil(readTimeInSeconds / 60); // convert back to minutes
  readTime += readTime > 1 ? ' minutes' : ' minute';
  return readTime;
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
    const {
      body: {
        description, body, references, categoryId
      }, user: { id: userId }
    } = req;
    const slug = description.replace(/\s+/g, '-').toLowerCase();
    let newArticle = await Article.create({
      slug, description, body, references, categoryId, authorId: userId
    });

    if (req.body.tags) {
      const newArticleTags = req.body.tags;
      const tagArray = formatTags(newArticleTags);
      const newTags = await insertTag(tagArray);
      newTags.forEach(async (tag) => {
        await newArticle.addTags(tag[0].id);
      });
    }

    newArticle = newArticle.toJSON();
    newArticle.readTime = getReadTime(newArticle.body);

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

/**
* @export
* @function getAllArticles
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
export const getAllArticles = async (req, res) => {
  const articles = await Article.findAll();

  const allArticles = articles.map((article) => {
    article = article.toJSON();
    article.readTime = getReadTime(article.body);
    article.averageRating = getReadTime(article.body);
    return article;
  });

  return res.status(200).send({
    status: 'success',
    data: allArticles
  });
};

/**
* @export
* @function getArticle
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
export const getArticle = async (req, res) => {
  const { params: { id: articleId } } = req;
  let foundArticle = await Article.findByPk(articleId);

  if (!foundArticle) {
    return res.status(404).send({
      status: 'fail',
      message: 'Resource not found'
    });
  }

  foundArticle = foundArticle.toJSON();
  foundArticle.readTime = getReadTime(foundArticle.body);
  foundArticle.averageRating = getReadTime(foundArticle.body);

  return res.status(200).send({
    status: 'success',
    data: foundArticle
  });
};
