import Sequelize from 'sequelize';
import {
  createLogger,
  format,
  transports
} from 'winston';
import {
  Article,
  LikeDislike,
  Tag,
  HighlightComment,
  Rating
} from '../../models';

const {
  Op
} = Sequelize;

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
      const newTag = await Tag.findOrCreate({
        where: {
          tagText: {
            [Op.eq]: tagText
          }
        },
        defaults: {
          tagText
        }
      });
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
    const {
      body: {
        slug,
        description,
        body,
        references,
        categoryId
      },
      user: {
        id: userId
      }
    } = req;
    const newArticle = await Article.create({
      slug,
      description,
      body,
      references,
      categoryId,
      authorId: userId
    });

    if (req.body.tags) {
      const newArticleTags = req.body.tags;
      const tagArray = formatTags(newArticleTags);
      const newTags = await insertTag(tagArray);
      newTags.forEach(async (tag) => {
        await newArticle.addTags(tag[0].id);
      });
    }

    return res.status(201).send({
      status: 'Success',
      data: newArticle
    });
  } catch (error) {
    return res.status(502).send({
      status: 'Error',
      message: 'OOPS! an error occurred while trying to create your article, you do not seem to be logged in or signed up, log in and try again!'
    });
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
    const {
      params: {
        id: articleId
      },
      user: {
        id: userId
      }
    } = req;

    const foundImpression = await LikeDislike.findOne({
      where: {
        articleId: {
          [Op.eq]: articleId
        },
        userId: {
          [Op.eq]: userId
        }
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
      const updatedImpression = await foundImpression.update({
        like: false
      }, {
        returning: true,
        plain: true
      });
      return res.status(200).send({
        status: 'success',
        data: {
          message: 'You unliked this Article!',
          impression: updatedImpression
        }
      });
    }

    if (foundImpression && !foundImpression.like) {
      const updatedImpression = await foundImpression.update({
        like: true,
        dislike: false
      }, {
        returning: true,
        plain: true
      });
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
    const {
      params: {
        id: articleId
      },
      user: {
        id: userId
      }
    } = req;

    const foundImpression = await LikeDislike.findOne({
      where: {
        articleId: {
          [Op.eq]: articleId
        },
        userId: {
          [Op.eq]: userId
        }
      }
    });

    if (!foundImpression) {
      const newImpression = await LikeDislike.create({
        articleId,
        userId,
        dislike: true
      });
      return res.status(201).send({
        status: 'success',
        data: {
          message: 'You disliked this Article!',
          impression: newImpression
        }
      });
    }

    if (foundImpression && foundImpression.dislike) {
      const updatedImpression = await foundImpression.update({
        dislike: false
      }, {
        returning: true,
        plain: true
      });
      return res.status(200).send({
        status: 'success',
        data: {
          message: 'You un-disliked this Article!',
          impression: updatedImpression
        }
      });
    }

    if (foundImpression && !foundImpression.dislike) {
      const updatedImpression = await foundImpression.update({
        like: false,
        dislike: true
      }, {
        returning: true,
        plain: true
      });
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
 * @function createHighlight
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const createHighlight = async (req, res) => {
  try {
    const {
      params: {
        id: articleId
      },
      user: {
        id: readerId
      },
      body: {
        highlight,
        comment
      }
    } = req;
    const newHighlight = await HighlightComment.create({
      articleId,
      readerId,
      highlight,
      comment
    });

    return res.status(201).send({
      status: 'success',
      data: {
        message: 'You highlighted successfully!',
        highlight: newHighlight
      }
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

/**
 * @export
 * @function getHighlights
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const getHighlights = async (req, res) => {
  try {
    const {
      params: {
        id: articleId
      },
      user: {
        id: readerId
      }
    } = req;
    const foundHighlights = await HighlightComment.findAll({
      attributes: ['articleId', 'readerId', 'highlight', 'comment'],
      where: {
        articleId: {
          [Op.eq]: articleId
        },
        readerId: {
          [Op.eq]: readerId
        }
      }
    });

    if (!foundHighlights.length) {
      return res.status(404).send({
        status: 'fail',
        data: {
          message: 'No highlight was found',
        }
      });
    }

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'You highlighted this Article!',
        highlights: foundHighlights
      }
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occured.'
    });
  }
};

/**
 * @export
 * @function ArticleRating
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const rateArticle = async (req, res) => {
  try {
    const {
      params: {
        articleId
      },
      user: {
        id: userId
      },
      body: {
        rating
      }
    } = req;

    const foundArticle = await Article.findOne({
      where: {
        id: {
          [Op.eq]: articleId
        },
      }
    });

    if (!foundArticle) {
      return res.status(404).send({
        status: 'fail',
        message: 'Article not found'
      });
    }
    const articleAuthor = await Article.findOne({
      where: {
        id: {
          [Op.eq]: articleId
        },
        authorId: {
          [Op.eq]: userId
        }
      }
    });

    if (!articleAuthor) {
      const userRating = await Rating.findOne({
        where: {
          articleId: {
            [Op.eq]: articleId
          },
          userId: {
            [Op.eq]: userId
          }
        }
      });

      if (!userRating) {
        await Rating.create({
          rating,
          articleId,
          userId
        });

        const allRatings = await (Rating.findAndCountAll({
          attributes: [
            [foundArticle.sequelize.fn('AVG',
              foundArticle.sequelize.col('rating')), 'averageRating']
          ],
          where: {
            articleId
          }
        }));

        const {
          count,
          rows
        } = allRatings;
        const ratingData = rows[0].toJSON();
        const {
          averageRating
        } = ratingData;
        const AvgRating = Math.ceil(averageRating);

        const article = foundArticle.toJSON();
        article.ratingsCount = count;
        article.averageRating = AvgRating;

        return res.status(201).send({
          status: 'success',
          message: 'Yaay! You just rated this article',
          article,
        });
      }
      return res.status(401).send({
        status: 'fail',
        message: 'You already rated this article'
      });
    }
    return res.status(401).send({
      status: 'fail',
      message: "Sorry! You can't rate your article"
    });
  } catch (e) {
    return res.status(502).send({
      status: 'Error',
      message: 'OOPS! an error occurred while trying to rate article. log in and try again!'
    });
  }
};
