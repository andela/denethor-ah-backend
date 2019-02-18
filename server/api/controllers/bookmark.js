import Sequelize from 'sequelize';
import env from 'dotenv';
import { Article, Bookmark } from '../../models';

env.config();

const {
  DOMAIN: domain
} = process.env;

const {
  Op
} = Sequelize;


export const createBookmark = async (req, res) => {
  try {
    const { params: { articleId }, user: { id: userId } } = req;

    const foundArticle = await Article.findOne({ where: { id: articleId } });

    if (!foundArticle) {
      return res.status(404).send({
        status: 'fail',
        message: 'Article not found'
      });
    }

    const link = `${domain}/api/articles/${articleId}`;
    const articleTitle = foundArticle.title;

    await Bookmark.findOrCreate({
      where: { userId, bookmarkTitle: articleTitle, articleUrl: link }
    }).spread((bookmark, created) => {
      if (created) {
        return res.status(201).send({
          status: 'success',
          message: 'Bookmark successful',
          bookmark
        });
      }
      return res.status(409).send({
        status: 'fail',
        message: 'You already bookmarked this article'
      });
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal Server Error!'
    });
  }
};

export const deleteBookmark = async (req, res) => {
  try {
    const { params: { articleId }, user: { id: userId } } = req;

    const link = `${domain}/api/articles/${articleId}`;

    const userBookmark = await Bookmark.findOne({
      where: {
        articleUrl: {
          [Op.eq]: link
        },
        userId: {
          [Op.eq]: userId
        }
      }
    });

    if (!userBookmark) {
      return res.status(404).send({
        status: 'fail',
        message: 'You are yet to bookmark this article'
      });
    }
    userBookmark.destroy();
    return res.status(200).send({
      status: 'success',
      message: 'Bookmark removed'
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal Server Error!'
    });
  }
};
export const getUserBookmarks = async (req, res) => {
  try {
    const { params: { userId } } = req;

    const userBookmarks = await Bookmark.findAll({ attributes: { exclude: ['userId', 'id'] }, where: { userId: { [Op.eq]: userId } } });
    if (!userBookmarks.length) {
      return res.status(404).send({
        status: 'fail',
        message: 'Sorry! You are yet to bookmark any article'
      });
    }

    return res.status(200).send({
      status: 'success',
      message: 'Bookmarks retrieved successfully',
      userBookmarks,
      bookmarkCount: userBookmarks.length
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal Server Error!'
    });
  }
};
