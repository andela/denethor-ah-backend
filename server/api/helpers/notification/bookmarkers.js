import moment from 'moment';
import { User, Article, Bookmark } from '../../../models';
import { articleGotNewComment } from '../mailer/mailer';
import database from '../../../config/firebase';

export default async (articleId, commentBody, commenterId) => {
  const bookmarks = await Bookmark.findAll({
    where: { articleUrl: `${process.env.DOMAIN}/api/articles/${articleId}` },
    attributes: { exclude: ['id', 'createdAt', 'updatedAt'] }
  });


  const { title } = await Article.findByPk(articleId);
  const { username: commenter } = await User.findByPk(commenterId);

  const notification = {
    message: `New comment in bookmarked article: '${title}'.`,
    articleId,
    time: moment().format()
  };

  const info = {
    commenter, commentBody, articleId, title
  };
  bookmarks.forEach(async ({ userId: id }) => {
    const { firstname, email, id: userId } = await User.findByPk(id);
    if (userId !== commenterId) {
      articleGotNewComment({ ...info, firstname, userId }, email);
      await database.ref(`notifications/${userId}`).push(notification);
    }
  });
};
