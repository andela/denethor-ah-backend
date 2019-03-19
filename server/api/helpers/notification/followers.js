import { User } from '../../../models';
import { newArticleMail } from '../mailer/mailer';

export default async (authorId, id, title) => {
  const authorObj = await User.findByPk(authorId);
  const followers = await authorObj.getFollowers({
    attributes: ['email', 'firstname', 'id', 'notifications']
  });

  const info = { author: `${authorObj.firstname}`, id, title };
  followers.forEach(async ({
    firstname, id: userId, email, notifications
  }) => {
    if (notifications) await newArticleMail({ ...info, firstname, userId }, email);
  });
};
