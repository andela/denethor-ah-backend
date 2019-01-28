import sgMail from '@sendgrid/mail';
import env from 'dotenv';

import verifyTemplate from './templates';
import resetPassowordTemplate from './resetPasswordTemplates';

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
const sendVerificationMail = (username, email, url) => {
  const msg = {
    to: email,
    from: 'support@authors-haven.com',
    subject: '[Author\'s Haven] Email Verification',
    html: verifyTemplate(username, url),
  };
  return sgMail.send(msg);
};

const resetPasswordVerificationMail = (username, email, token) => {
  const msg = {
    to: email,
    from: 'support@authors-haven.com',
    subject: '[Author\'s Haven] Email Verification',
    html: resetPassowordTemplate(username, token),
  };
  return sgMail.send(msg);
};

export { sendVerificationMail, resetPasswordVerificationMail };
