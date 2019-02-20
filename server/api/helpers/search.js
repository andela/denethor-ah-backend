import Sequelize from 'sequelize';
import { User, Tag, Article } from '../../models';

const { Op } = Sequelize;
let foundAuthorId;
let foundArticles;
let foundTag;

const findAuthorId = async (username) => {
  try {
    const foundAuthorObj = await User.findOne({
      where: {
        username: { [Op.eq]: username }
      }
    });

    return foundAuthorObj.id;
  } catch (e) {
    return undefined;
  }
};

const findTag = async (id) => {
  try {
    const foundTagObj = await Tag.findByPk(id);

    return foundTagObj;
  } catch (e) {
    return undefined;
  }
};

export const getArticlesByAllParams = async (username, tagId, searchString) => {
  try {
    foundAuthorId = await findAuthorId(username);
    foundTag = await findTag(tagId);
    foundArticles = await foundTag.getArticles({
      where: {
        authorId: { [Op.eq]: foundAuthorId },
        [Op.or]: [
          { body: { [Op.iLike]: `%${searchString}%` } },
          { title: { [Op.iLike]: `%${searchString}%` } }
        ]
      }
    });

    return foundArticles;
  } catch (e) {
    return undefined;
  }
};

export const getArticlesBySearchTagParams = async (tagId, searchString) => {
  try {
    foundTag = await findTag(tagId);
    foundArticles = await foundTag.getArticles({
      where: {
        [Op.or]: [
          { body: { [Op.iLike]: `%${searchString}%` } },
          { title: { [Op.iLike]: `%${searchString}%` } }
        ]
      }
    });

    return foundArticles;
  } catch (e) {
    return undefined;
  }
};

export const getArticlesBySearchAuthorParams = async (username, searchString) => {
  try {
    foundAuthorId = await findAuthorId(username);
    foundArticles = await Article.findAll({
      where: {
        authorId: { [Op.eq]: foundAuthorId },
        [Op.or]: [
          { body: { [Op.iLike]: `%${searchString}%` } },
          { title: { [Op.iLike]: `%${searchString}%` } }
        ]
      }
    });

    return foundArticles;
  } catch (e) {
    return undefined;
  }
};

export const getArticlesByTagAuthorParams = async (tagId, username) => {
  try {
    foundTag = await findTag(tagId);
    foundAuthorId = await findAuthorId(username);
    foundArticles = await foundTag.getArticles({
      where: {
        authorId: { [Op.eq]: foundAuthorId }
      }
    });

    return foundArticles;
  } catch (e) {
    return undefined;
  }
};

export const getArticlesBySearchParam = async (searchString) => {
  try {
    foundArticles = Article.findAll({
      where: {
        [Op.or]: [
          { body: { [Op.iLike]: `%${searchString}%` } },
          { title: { [Op.iLike]: `%${searchString}%` } }
        ]
      }
    });

    return foundArticles;
  } catch (e) {
    return undefined;
  }
};

export const getArticlesByTagParam = async (tagId) => {
  try {
    foundTag = await findTag(tagId);
    foundArticles = await foundTag.getArticles();

    return foundArticles;
  } catch (e) {
    return undefined;
  }
};

export const getArticlesByAuthorParam = async (username) => {
  try {
    foundAuthorId = await findAuthorId(username);
    foundArticles = await Article.findAll({
      where: {
        authorId: { [Op.eq]: foundAuthorId }
      }
    });

    return foundArticles;
  } catch (e) {
    return undefined;
  }
};
