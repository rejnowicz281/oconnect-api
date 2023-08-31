const passport = require("passport");
const User = require("../models/user");
const FacebookTokenStrategy = require("passport-facebook-token");
const debug = require("debug")("app:facebook");

passport.use(
    new FacebookTokenStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            profileFields: ["id", "name", "picture.type(large)"],
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await User.findOne({ provider: "https://www.facebook.com/", subject: profile.id });

            if (user) {
                debug("Facebook User found, logging in...");
                return done(null, user);
            } else {
                debug("Facebook User not found, creating new user...");
                const newUser = new User({
                    provider: "https://www.facebook.com/",
                    subject: profile.id,
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName,
                    avatar: { url: profile.photos[0].value },
                });
                await newUser.save();
                debug("New Facebook user created, logging in...");

                return done(null, newUser);
            }
        }
    )
);

module.exports = passport;
