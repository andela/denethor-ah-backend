import { Tag } from '../../models';

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
