const express = require("express");
const passport = require("passport");
const { generateAccessToken, generateRefreshToken } = require("../helpers/generateTokens");

const router = express.Router();

const { facebookLogin } = require("../controllers/facebookController");
const { getAccessToken, githubLogin } = require("../controllers/githubController");
const { register, login, logout, demoLogin, refresh } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/demo", demoLogin);
router.post("/logout", logout);
router.post("/facebook", passport.authenticate("facebook-token", { session: false }), facebookLogin);
router.post("/refresh", passport.authenticate("jwtRefreshToken", { session: false }), refresh);
router.post("/github/token", getAccessToken);
router.post("/github/login", passport.authenticate("github-token", { session: false }), githubLogin);

module.exports = router;
