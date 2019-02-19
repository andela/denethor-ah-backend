import { Shares, Article } from '../../models';

/**
 *
 * @function shareArticle
 * @param {*} req any
 * @param {*} res  any
 * @returns {Object} JSON object
 */
export const shareArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    const shareType = req.query.sharetype;

    if (shareType !== 'facebook' && shareType !== 'twitter') {
      return res.status(422).send({
        status: 'fail',
        message: 'Invalid share type'
      });
    }

    const findArticle = await Article.findById(articleId);

    if (!findArticle) {
      return res.status(404).send({
        status: 'fail',
        message: 'No such article'
      });
    }

    const articleShare = await Shares.findOne({ where: { articleId, shareType } });

    if (!articleShare) {
      const newShare = {
        articleId,
        shareType
      };

      await Shares.create(newShare);

      return res.status(201).send({
        status: 'success',
        message: 'You shared this article'
      });
    }

    await articleShare.update({ shareCount: articleShare.shareCount + 1 });

    return res.status(201).send({
      status: 'success',
      message: 'You shared this article'
    });
  } catch (error) {
    return res.status(500).send({ status: 'Error', error: 'An error occurred while trying to share this article!' });
  }
};
