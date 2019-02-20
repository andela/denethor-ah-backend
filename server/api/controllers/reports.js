import { ArticleReports, Article } from '../../models';

/**
 *
 * @function reportArticle
 * @param {*} req any
 * @param {*} res  any
 * @returns {Object} JSON object
 */
export const reportArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;
    const newReport = {
      userId,
      articleId
    };
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).send({
        status: 'fail',
        message: 'No article with that id'
      });
    }

    const articleReport = await ArticleReports.findOne({ where: { userId, articleId }, defaults: { newReport } });
    if (articleReport) {
      return res.status(422).send({
        status: 'fail',
        message: 'You already reported this article'
      });
    }
    await ArticleReports.create(newReport);
    const reportCount = await ArticleReports.findAndCountAll({ where: { articleId }, offset: 10, limit: 2 });

    if (reportCount.count >= 5) {
      await Article.destroy({ where: { id: articleId }, force: true });
    }
    return res.status(201).send({ status: 'Success', message: `Hello ${req.user.firstname} you just reported this article` });
  } catch (error) {
    return res.status(500).send({ status: 'Error', error: 'An error occurred while trying to report this article!' });
  }
};
