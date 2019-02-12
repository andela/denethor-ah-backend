"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressSession = _interopRequireDefault(require("express-session"));

var _connectPgSimple = _interopRequireDefault(require("connect-pg-simple"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv.default.config();

const {
  SESS_SECRET: secret,
  NODE_ENV: env,
  DATABASE_URL_DEV,
  DATABASE_URL
} = process.env;
const conString = env === 'development' ? DATABASE_URL_DEV : DATABASE_URL;

const sessionManagementConfig = app => {
  _expressSession.default.Session.prototype.login = function (user, cb) {
    const {
      req
    } = this;
    req.session.regenerate(err => {
      if (err) {
        cb(err);
      }
    });
    req.session.userInfo = user;
    cb();
  };

  const pgSessionStore = (0, _connectPgSimple.default)(_expressSession.default);
  const pgStoreConfig = {
    conString,
    ttl: 1 * 60 * 60
  };
  app.use((0, _expressSession.default)({
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

var _default = sessionManagementConfig;
exports.default = _default;