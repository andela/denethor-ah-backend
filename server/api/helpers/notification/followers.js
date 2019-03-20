import moment from 'moment';
import { User } from '../../../models';
import { newArticleMail } from '../mailer/mailer';
import database from '../../../config/firebase';

export default async (authorId, id, title) => {
  const authorObj = await User.findByPk(authorId);
  const followers = await authorObj.getFollowers({
    attributes: ['id', 'email', 'firstname', 'notifications']
  });

  const notification = {
    message: `${authorObj.firstname} posted a new article: "${title}".`,
    articleId: id,
    time: moment().format()
  };

  const info = { author: `${authorObj.firstname}`, id, title };
  followers.forEach(async ({
    id: recipientId, firstname, email, notifications
  }) => {
    await database.ref(`notifications/${recipientId}`).push(notification);
    if (process.env.NODE_ENV === 'production') {
      if (notifications) await newArticleMail({ ...info, firstname }, email);
    }
  });
};
