import sgMail from '@sendgrid/mail';
import env from 'dotenv';

import verifyTemplate from './templates';

env.config();
sgMail.setApiKey(process.env.SENDGRID_KEY);

/**
  * @export
  * @function sendVerificationMail
  * @param {Object} username - created User's username
  * @param {Object} email - created User's email
  * @param {Object} id - created User's ID
  * @returns {null} null
  */
const sendVerificationMail = (username, email, id) => {
  const msg = {
    to: email,
    from: 'support@authors-haven.com',
    subject: '[Author\'s Haven] Email Verification',
    html: verifyTemplate(username, id),
  };
  return sgMail.send(msg);
};

export default sendVerificationMail;
