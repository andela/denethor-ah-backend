import Sequelize from 'sequelize';
import { createLogger, format, transports } from 'winston';
import { omit } from 'lodash';
import notifyFollowers from '../helpers/notification/followers';
import {
  User, Article, LikeDislike, Tag, Rating, Category, Comment, CommentHistory
} from '../../models';
import {
  getArticlesByAllParams, getArticlesBySearchTagParams, getArticlesBySearchAuthorParams,
  getArticlesByTagAuthorParams, getArticlesBySearchParam, getArticlesByTagParam,
  getArticlesByAuthorParam
} from '../helpers/search';
import database from '../../config/firebase';
import getReadTime from '../helpers/getReadTime';

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
      const newTag = await Tag.findOrCreate({
        where: {
          tagText: { [Op.eq]: tagText }
        },
        defaults: { tagText }
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
        title,
        description,
        body,
        references,
        categoryId
      },
      user: { id: userId }
    } = req;
    // create the slug from the title by replacing spaces with hyphen
    // eg. "Introduction to writing" becomes "introduction-to-writing"
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    let newArticle = await Article.create({
      slug,
      title,
      description,
      body,
      references,
      categoryId,
      authorId: userId
    });

    if (req.body.tags) {
      const newArticleTags = req.body.tags;
      const tagArray = await formatTags(newArticleTags);
      const newTags = await insertTag(tagArray);
      newTags.forEach(async (tag) => {
        await newArticle.addTags(tag[0].id);
      });
    }

    newArticle = newArticle.toJSON();
    newArticle.readTime = getReadTime(newArticle.body);


    const { authorId, id } = newArticle;
    notifyFollowers(authorId, id, title);

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
    const { params: { articleId }, user: { id: userId } } = req;

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
        likeImpression: true
      });
      return res.status(200).send({
        status: 'success',
        data: {
          message: 'You liked this Article!',
          impression: newImpression
        }
      });
    }

    if (foundImpression && foundImpression.likeImpression) {
      const updatedImpression = await foundImpression.update({
        likeImpression: false
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

    if (foundImpression && !foundImpression.likeImpression) {
      const updatedImpression = await foundImpression.update({
        likeImpression: true,
        dislikeImpression: false
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
        articleId
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
        dislikeImpression: true
      });
      return res.status(201).send({
        status: 'success',
        data: {
          message: 'You disliked this Article!',
          impression: newImpression
        }
      });
    }

    if (foundImpression && foundImpression.dislikeImpression) {
      const updatedImpression = await foundImpression.update({
        dislikeImpression: false
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

    if (foundImpression && !foundImpression.dislikeImpression) {
      const updatedImpression = await foundImpression.update({
        likeImpression: false,
        dislikeImpression: true
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

/**
* @export
* @function getAllArticles
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
export const getAllArticles = async ({ query: { n = 0, category } }, res) => {
  const limit = 10;
  const offset = Number(n) * limit;

  const queryObj = {
    include: [{
      model: User,
      as: 'author',
      attributes: ['username', 'imageUrl']
    }, {
      model: Rating,
      as: 'articleRatings'
    }],
    limit,
    offset
  };
  if (category) {
    const articleCategory = await Category.findOne({
      where: { categoryName: { [Op.eq]: category.toLowerCase() } }
    });

    if (!articleCategory) {
      return res.status(404).send({
        status: 'error',
        message: 'No such category'
      });
    }

    const categoryId = articleCategory.id;
    queryObj.where = { categoryId: { [Op.eq]: categoryId } };
  }
  try {
    const { rows: articles, count } = await Article.findAndCountAll(queryObj);
    const allArticles = articles.map((article) => {
      article = article.toJSON();
      article.readTime = getReadTime(article.body);
      return article;
    });

    return res.status(200).send({
      status: 'success',
      data: allArticles,
      count
    });
  } catch (err) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error'
    });
  }
};


export const getArticleRatings = async ({ params: { articleId } }, res) => {
  try {
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

    if (foundArticle) {
      const allRatings = await foundArticle.getArticleRatings();

      res.status(200).send({
        status: 'success',
        data: allRatings
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
* @export
* @function getArticle
* @param {Object} req - request received
* @param {Object} res - response object
* @returns {Object} JSON object (JSend format)
*/
export const getArticle = async (req, res) => {
  const { params: { articleId } } = req;
  try {
    let foundArticle = await Article.findOne({
      where: { id: { [Op.eq]: articleId } },
      include: [{
        model: User,
        as: 'author',
        attributes: ['firstname', 'lastname', 'username', 'imageUrl']
      }, {
        model: Rating,
        as: 'articleRatings'
      }]
    });

    if (!foundArticle) {
      return res.status(404).send({
        status: 'fail',
        message: 'Resource not found'
      });
    }

    let readCount;

    const snapshot = await database.ref(`stats/${foundArticle.id}`).once('value');
    const existingReadCount = snapshot.val();
    if (existingReadCount) {
      await database.ref(`stats/${foundArticle.id}`).set(existingReadCount + 1);
      readCount = existingReadCount + 1;
    } else {
      await database.ref(`stats/${foundArticle.id}`).set(1);
      readCount = 1;
    }

    const comments = await Comment.findAll({
      where: { articleId: { [Op.eq]: foundArticle.id } },
      order: [['createdAt', 'DESC']],
      include: [{
        model: CommentHistory,
        as: 'commentHistories'
      }]
    });

    let articleComments = comments.map(async (comment) => {
      const user = await User.findById(comment.userId, {
        attributes: {
          exclude: [
            'email',
            'password',
            'role',
            'bio',
            'notifications',
            'isVerified',
            'createdAt',
            'updatedAt'
          ]
        },
      });

      const editedComment = omit(comment.toJSON(), ['userId']);
      editedComment.user = user.toJSON();
      return editedComment;
    });

    articleComments = await Promise.all(articleComments);
    const articleTags = await foundArticle.getTags();

    foundArticle = foundArticle.toJSON();
    foundArticle.readTime = getReadTime(foundArticle.body);
    foundArticle.comments = articleComments;
    foundArticle.tags = articleTags;
    foundArticle.readCount = readCount;

    return res.status(200).send({
      status: 'success',
      data: foundArticle
    });
  } catch (err) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error'
    });
  }
};


/**
 * @export
 * @function updateArticle
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const updateArticle = async (req, res) => {
  try {
    const {
      body,
      params: {
        articleId
      },
      user: {
        id: userId
      }
    } = req;

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
      return res.status(401).send({
        status: 'fail',
        message: "Sorry you can't edit this article"
      });
    }
    const updatedArticle = await articleAuthor.update(
      body, { returning: true, plain: true }
    );

    return res.status(200).send({
      status: 'success',
      message: 'Yaay! You just updated this article',
      updatedArticle
    });
  } catch (e) {
    return res.status(500).send({
      status: 'Error',
      message: 'OOPS! an error occurred while trying to update this article. log in and try again!'
    });
  }
};


/**
 * @export
 * @function deleteArticle
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const deleteArticle = async (req, res) => {
  const { params: { articleId }, user: { id: userId, role } } = req;
  try {
    const foundArticle = await Article.findOne({
      where: {
        id: { [Op.eq]: articleId }
      }
    });
    if (!foundArticle) {
      return res.status(404).send({
        status: 'fail',
        message: 'Article not found'
      });
    }
    if ((foundArticle.authorId !== userId) && (role !== 'admin') && (role !== 'super-admin')) {
      return res.status(401).send({
        status: 'fail',
        message: 'Sorry not authorized'
      });
    }

    await foundArticle.destroy();

    return res.status(200).send({
      status: 'success',
      message: 'Article deleted successfully',
    });
  } catch (e) {
    return res.status(500).send({
      status: 'Error',
      message: 'OOPS! an error occurred while trying to delete this article. log in and try again!'
    });
  }
};

/**
 * @export
 * @function filterArticle
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const filterArticle = async (req, res) => {
  const { query: { searchStr, tag, author } } = req;
  let foundArticles;

  try {
    if (searchStr && tag && author) {
      foundArticles = await getArticlesByAllParams(author, tag, searchStr);
    } else if (searchStr && tag) {
      foundArticles = await getArticlesBySearchTagParams(tag, searchStr);
    } else if (searchStr && author) {
      foundArticles = await getArticlesBySearchAuthorParams(author, searchStr);
    } else if (tag && author) {
      foundArticles = await getArticlesByTagAuthorParams(tag, author);
    } else if (searchStr) {
      foundArticles = await getArticlesBySearchParam(searchStr);
    } else if (tag) {
      foundArticles = await getArticlesByTagParam(tag);
    } else if (author) {
      foundArticles = await getArticlesByAuthorParam(author);
    }

    if (!foundArticles.length) {
      return res.status(404).send({
        status: 'fail',
        data: { message: 'No Article was found' }
      });
    }

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'Articles found',
        articles: foundArticles
      }
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error occurred'
    });
  }
};

/**
 * @export
 * @function getTags
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const getTags = async (req, res) => {
  try {
    const foundTags = await Tag.findAll({
      attributes: ['id', 'tagText']
    });

    if (!foundTags.length) {
      return res.status(404).send({
        status: 'fail',
        data: { message: 'No Tag was found' }
      });
    }

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'Tags found',
        tags: foundTags
      }
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};


/**
 * @export
 * @function getArticleLikes
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const getArticleLikes = async (req, res) => {
  const { params: { articleId } } = req;

  try {
    const foundArticle = await Article.findByPk(articleId);

    if (!foundArticle) {
      return res.status(404).send({
        status: 'fail',
        message: 'Article not found'
      });
    }

    const articleLikes = await foundArticle.getLikes();

    return res.status(200).send({
      status: 'success',
      data: articleLikes
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
};

/**
 * @export
 * @function getArticleDislikes
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const getArticleDislikes = async (req, res) => {
  const { params: { articleId } } = req;

  try {
    const foundArticle = await Article.findByPk(articleId);

    if (!foundArticle) {
      return res.status(404).send({
        status: 'fail',
        message: 'Article not found'
      });
    }

    const articleDislikes = await foundArticle.getDislikes();

    return res.status(200).send({
      status: 'success',
      data: articleDislikes
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
};
