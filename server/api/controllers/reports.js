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
    const articleId = req.params.id;
    const newReport = {
      userId,
      articleId
    };
    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error('Article is not found');
    }

    const articleReport = await ArticleReports.findOne({ where: { userId, articleId }, defaults: { newReport } });
    if (articleReport) {
      throw new Error(`Hello ${req.user.firstname} You've already reported this article`);
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
