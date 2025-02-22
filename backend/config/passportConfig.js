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
    const user = await User.findById(jwt_payload.userId); 
    if (!user) {
      return done(null, false); 
    }
    return done(null, user); 
  } catch (err) {
    done(err, false);
  }
}));

module.exports = passport;
