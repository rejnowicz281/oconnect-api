const GithubTokenStrategy = require("passport-github-token");
const User = require("../models/user");
const passport = require("passport");
const debug = require("debug")("app:github");

passport.use(
    new GithubTokenStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, next) => {
            const user = await User.findOne({ provider: "https://www.github.com/", subject: profile.id });

            if (user) {
                debug("Github User found, logging in...");
                return next(null, user);
            } else {
                debug("Github User not found, creating new user using profile info...");
                const newUser = new User({
                    provider: "https://www.github.com/",
                    subject: profile.id,
                    first_name: profile.name?.givenName || profile.username.toUpperCase(),
                    last_name: profile.name?.familyName || "Github",
                    avatar: { url: profile._json.avatar_url },
                });
                await newUser.save();
                debug("New Github user created, logging in...");

                return next(null, newUser);
            }
        }
    )
);
