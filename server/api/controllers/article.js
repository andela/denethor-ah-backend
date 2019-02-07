import { Article } from '../../models';

export const createArticle = async (req, res) => {
  try {
    const newArticleData = req.body;
    const userId = req.user.id;
    newArticleData.authorId = userId;
    const newArticle = await Article.create(newArticleData);
    return res.status(201).send({ status: 'Success', data: newArticle });
  } catch (error) {
    return res.status(502).send({ status: 'Error', message: 'OOPS! an error occurred while trying to create your article, you do not seem to be logged in or signed up, log in and try again!' });
  }
};
