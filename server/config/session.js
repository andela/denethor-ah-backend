import session from 'express-session';
import pgSession from 'connect-pg-simple';
import dotenv from 'dotenv';

dotenv.config();
const {
  SESS_SECRET: secret, NODE_ENV: env, DATABASE_URL_DEV, DATABASE_URL
} = process.env;

const conString = env === 'development'
  ? DATABASE_URL_DEV : DATABASE_URL;

const sessionManagementConfig = (app) => {
  session.Session.prototype.login = function (user, cb) {
    const { req } = this;
    req.session.regenerate((err) => {
      if (err) {
        cb(err);
      }
    });
    req.session.userInfo = user;
    cb();
  };
  const pgSessionStore = pgSession(session);
  const pgStoreConfig = {
    conString, ttl: (1 * 60 * 60)
  };
  app.use(session({
    store: new pgSessionStore(pgStoreConfig),
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      path: '/',
      expires: true,
      httpOnly: true,
      secure: env === 'production',
      maxAge: 1 * 60 * 60 * 1000
    },
    name: 'id'
  }));
};

export default sessionManagementConfig;
