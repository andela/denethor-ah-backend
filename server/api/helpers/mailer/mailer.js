import sgMail from '@sendgrid/mail';
import env from 'dotenv';

import verifyTemplate from './templates/templates';
import resetPassowordTemplate from './templates/resetPasswordTemplates';
import newArticleTemplate from './templates/newArticleTemplate';
import articleGotNewCommentTemplate from './templates/articleGotNewComment';

env.config();
sgMail.setApiKey(process.env.SENDGRID_KEY);

/**
  * @export
  * @function sendVerificationMail
  * @param {Object} username - created User's username
  * @param {Object} email - created User's email
  * @param {Object} url - created User's ID
  * @returns {null} null
  */
export const sendVerificationMail = (username, email, url) => {
  const msg = {
    to: email,
    from: 'support@authors-haven.com',
    subject: '[Author\'s Haven] Email Verification',
    html: verifyTemplate(username, url),
  };
  return sgMail.send(msg);
};

export const resetPasswordVerificationMail = (username, email, token) => {
  const msg = {
    to: email,
    from: 'support@authors-haven.com',
    subject: '[Author\'s Haven] Email Verification',
    html: resetPassowordTemplate(username, token),
  };
  return sgMail.send(msg);
};


export const newArticleMail = (info, email) => {
  const msg = {
    to: email,
    from: 'support@authors-haven.com',
    subject: `New article from ${info.author}`,
    html: newArticleTemplate(info),
  };
  return sgMail.send(msg);
};

export const articleGotNewComment = (info, email) => {
  const msg = {
    to: email,
    from: 'support@authors-haven.com',
    subject: 'New comments on your bookmarked article',
    html: articleGotNewCommentTemplate(info),
  };
  return sgMail.send(msg);
};
