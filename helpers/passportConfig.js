const passport = require("passport");
const User = require("../models/user");
const JWTStrategy = require("passport-jwt").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const facebookDebug = require("debug")("app:facebook");
const jwtDebug = require("debug")("app:jwt");

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
                    jwtDebug("User is authenticated - proceeding...");
                    return done(null, user);
                } else {
                    jwtDebug("User is not authenticated - aborting...");
                    return done(null, false);
                }
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: "http://localhost:3000/facebook/callback",
            profileFields: ["id", "emails", "name", "picture.type(large)"],
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await User.findOne({ provider: "https://www.facebook.com/", subject: profile.id });

            if (user) {
                facebookDebug("User found, logging in...");
                return done(null, user);
            } else {
                facebookDebug("User not found, creating new user...");
                const newUser = new User({
                    provider: "https://www.facebook.com/",
                    subject: profile.id,
                    email: profile.emails ? profile.emails[0].value : undefined,
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName,
                    avatar: profile.photos[0].value,
                });
                await newUser.save();
                facebookDebug("New user created, logging in...");

                return done(null, newUser);
            }
        }
    )
);
