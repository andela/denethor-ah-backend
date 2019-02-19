import { User, Article, Bookmark } from '../../../models';
import { articleGotNewComment } from '../mailer/mailer';

export default async (articleId, commentBody, commenterId) => {
  const bookmarks = await Bookmark.findAll({
    where: { articleUrl: `${process.env.DOMAIN}/api/articles/${articleId}` },
    attributes: { exclude: ['id', 'createdAt', 'updatedAt'] }
  });


  const { title } = await Article.findByPk(articleId);
  const { username: commenter } = await User.findByPk(commenterId);


  const info = {
    commenter, commentBody, articleId, title
  };

  bookmarks.forEach(async ({ userId }) => {
    const { firstname, email } = await User.findByPk(userId);
    articleGotNewComment({ ...info, firstname }, email);
  });
};
