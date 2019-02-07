import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import GoogleStrategy from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import env from 'dotenv';

import { User } from '../../../models';

env.config();


const options = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
  return platform !== 'twitter'
    ? { clientID, clientSecret, callbackURL }
    : { consumerKey, consumerSecret, callbackURL };
};

const passportCallback = (accessToken, refreshToken, {
  id, username, displayName, name, emails: [{ value: email }], photos: [{ value: imageUrl }]
}, done) => {
  const { givenName: firstname = displayName, familyName: lastname } = name || {};
  const profile = {
    firstname, lastname, email, imageUrl
  };
  profile.username = username || name.givenName + id.slice(-6, -1);
  profile.password = id.slice(0, 6);
  done(null, profile);
};

const profileFields = ['id', 'displayName', 'name', 'gender', 'profileUrl', 'email', 'photos'];

const googleCredentials = credentials('google', googleClientID, googleClientSecret);
const facebookCredentials = { ...credentials('facebook', facebookAppID, facebookAppSecret), profileFields };
const twitterCredentials = { ...credentials('twitter'), includeEmail: true };


const googleStrategy = new GoogleStrategy(googleCredentials, passportCallback);
const facebookStrategy = new FacebookStrategy(facebookCredentials, passportCallback);
const twitterStrategy = new TwitterStrategy(twitterCredentials, passportCallback);

passport.use(googleStrategy);
passport.use(facebookStrategy);
passport.use(twitterStrategy);
passport.use(new JWTStrategy(options, async (payload, done) => {
  try {
    const user = await User.findByPk(payload.id);

    if (!user) {
      return done(new Error('Authentication failed'), false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

export default passport;
