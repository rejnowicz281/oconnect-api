const debug = require("debug")("app:jwtRefreshToken");
const JWTStrategy = require("passport-jwt").Strategy;
const passport = require("passport");
const User = require("../models/user");

function cookieExtractor(req) {
    let token = null;
    if (req && req.cookies) token = req.cookies["refresh_token"];

    return token;
}

passport.use(
    "jwtRefreshToken",
    new JWTStrategy(
        {
            secretOrKey: process.env.REFRESH_TOKEN_SECRET,
            jwtFromRequest: cookieExtractor,
        },
        async (payload, done) => {
            try {
                const user = await User.findById(payload.sub);

                if (user) {
                    debug("Refresh token valid - proceeding...");
                    return done(null, user);
                } else {
                    debug("Refresh token invalid - aborting...");
                    return done(null, false);
                }
            } catch (error) {
                done(error, null);
            }
        }
    )
);

module.exports = passport;
