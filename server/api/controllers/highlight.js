import Sequelize from 'sequelize';

import { HighlightComment } from '../../models';

const { Op } = Sequelize;
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
      params: { articleId },
      user: { id: readerId },
      body: { highlight, comment }
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
      params: { articleId },
      user: { id: readerId }
    } = req;
    const foundHighlights = await HighlightComment.findAll({
      attributes: ['articleId', 'readerId', 'highlight', 'comment'],
      where: {
        articleId: { [Op.eq]: articleId },
        readerId: { [Op.eq]: readerId }
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
 * @function editHighlight
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const editHighlight = async (req, res) => {
  try {
    const { params: { articleId, highlightId }, body: { comment }, user: { id: readerId } } = req;

    const foundHighlight = await HighlightComment.findOne({
      where: {
        id: { [Op.eq]: highlightId },
        articleId: { [Op.eq]: articleId },
        readerId: { [Op.eq]: readerId }
      }
    });

    if (!foundHighlight) {
      return res.status(404).send({
        status: 'fail',
        data: {
          message: 'No highlight was found',
        }
      });
    }

    const updatedHighlight = await foundHighlight.update({ comment },
      { returning: true, plain: true });

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'Your highlight updated successfully',
        highlight: updatedHighlight
      }
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal Server error occured'
    });
  }
};

/**
 * @export
 * @function deleteHighlight
 * @param {Object} req - request received
 * @param {Object} res - response object
 * @returns {Object} JSON object (JSend format)
 */
export const deleteHighlight = async (req, res) => {
  try {
    const { params: { articleId, highlightId }, user: { id: readerId, role } } = req;
    const foundHighlight = await HighlightComment.findOne({
      where: {
        id: { [Op.eq]: highlightId },
        articleId: { [Op.eq]: articleId }
      }
    });

    if (!foundHighlight) {
      return res.status(404).send({
        status: 'fail',
        data: {
          message: 'No highlight was found',
        }
      });
    }

    if (role !== 'admin' && foundHighlight.readerId !== readerId) {
      return res.status(401).send({
        status: 'fail',
        data: {
          message: 'Not authorized'
        }
      });
    }

    await foundHighlight.destroy();

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'Highlight was deleted successfully',
        comment: null
      }
    });
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal Server error occured'
    });
  }
};
