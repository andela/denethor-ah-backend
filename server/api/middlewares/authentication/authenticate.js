import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import env from 'dotenv';

import { User } from '../../../models';

env.config();

const options = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

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
