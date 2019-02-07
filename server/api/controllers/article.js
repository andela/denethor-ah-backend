import { Article } from '../../models';

export const createArticle = async (req, res) => {
  try {
    const newArticleData = req.body;
    const userId = req.user.id;
    newArticleData.authorId = userId;
    const newArticle = await Article.create(newArticleData);
    res.status(201).send({ data: newArticle });
  } catch (error) {
    res.status(502).send({ error, message: 'OOPS! an error occurred while trying to create your article, you do not seem to be logged in or signed up, log in and try again!' });
  }
};
