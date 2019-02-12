"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.passportCallback = void 0;

var _passport = _interopRequireDefault(require("passport"));

var _passportJwt = require("passport-jwt");

var _passportGoogleOauth = _interopRequireDefault(require("passport-google-oauth20"));

var _passportFacebook = require("passport-facebook");

var _passportTwitter = require("passport-twitter");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _models = require("../../../models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_dotenv.default.config();

const options = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: _passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken()
};
const {
  GOOGLE_CLIENT_ID: googleClientID,
  GOOGLE_CLIENT_SECRET: googleClientSecret,
  FACEBOOK_APP_ID: facebookAppID,
  FACEBOOK_APP_SECRET: facebookAppSecret,
  TWITTER_CONSUMER_KEY: consumerKey,
  TWITTER_CONSUMER_SECRET: consumerSecret,
  DOMAIN: domain
} = process.env;

const credentials = (platform, clientID, clientSecret) => {
  const callbackURL = `${domain}/api/users/${platform}/redirect`;
  return platform !== 'twitter' ? {
    clientID,
    clientSecret,
    callbackURL
  } : {
    consumerKey,
    consumerSecret,
    callbackURL
  };
};

const passportCallback = (accessToken, refreshToken, {
  id,
  username,
  displayName,
  name,
  emails: [{
    value: email
  }],
  photos: [{
    value: imageUrl
  }]
}, done) => {
  const {
    givenName: firstname = displayName,
    familyName: lastname
  } = name || {};
  const profile = {
    firstname,
    lastname,
    email,
    imageUrl
  };
  profile.username = username || name.givenName + id.slice(-6, -1);
  profile.password = id.slice(0, 6);
  profile.role = 'author';
  done(null, profile);
};

exports.passportCallback = passportCallback;
const profileFields = ['id', 'displayName', 'name', 'gender', 'profileUrl', 'email', 'photos'];
const googleCredentials = credentials('google', googleClientID, googleClientSecret);

const facebookCredentials = _objectSpread({}, credentials('facebook', facebookAppID, facebookAppSecret), {
  profileFields
});

const twitterCredentials = _objectSpread({}, credentials('twitter'), {
  includeEmail: true
});

const googleStrategy = new _passportGoogleOauth.default(googleCredentials, passportCallback);
const facebookStrategy = new _passportFacebook.Strategy(facebookCredentials, passportCallback);
const twitterStrategy = new _passportTwitter.Strategy(twitterCredentials, passportCallback);

_passport.default.use(googleStrategy);

_passport.default.use(facebookStrategy);

_passport.default.use(twitterStrategy);

_passport.default.use(new _passportJwt.Strategy(options, async (payload, done) => {
  try {
    const user = await _models.User.findByPk(payload.id);

    if (!user) {
      return done(new Error('Authentication failed'), false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

var _default = _passport.default;
exports.default = _default;