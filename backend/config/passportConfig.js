// config/passportConfig.js
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.userId).select('-password');
    
    if (!user) return done(null, false);
    
    const userPayload = {
      userId: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    };

    return done(null, userPayload);
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;