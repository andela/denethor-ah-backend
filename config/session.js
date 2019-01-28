import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const { SESS_SECRET: sessSecret } = process.env;

export default session({
  secret: sessSecret,
  resave: false,
  saveUninitialized: false
});
