const passport = require("passport");
const User = require("../models/user");
const JWTStrategy = require("passport-jwt").Strategy;

const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) token = req.cookies["access_token"];

    return token;
};

passport.use(
    new JWTStrategy(
        {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: cookieExtractor,
        },
        async (payload, done) => {
            try {
                const user = await User.findById(payload.sub);

                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            } catch (error) {
                done(error, null);
            }
        }
    )
);
