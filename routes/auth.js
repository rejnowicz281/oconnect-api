const express = require("express");
const passport = require("passport");
const { generateAccessToken, generateRefreshToken } = require("../helpers/generateTokens");

const router = express.Router();

const { register, login, logout, demoLogin } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/demo", demoLogin);
router.post("/logout", logout);
router.post("/facebook", passport.authenticate("facebook-token", { session: false }), (req, res) => {
    const refresh_token = generateRefreshToken(req.user._id);
    const access_token = generateAccessToken(req.user);

    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
        .status(200)
        .json({ message: "Facebook Login Successful", access_token });
});
router.post("/refresh", passport.authenticate("jwtRefreshToken", { session: false }), (req, res) => {
    const access_token = generateAccessToken(req.user);

    res.status(200).json({ message: "Refresh Successful", access_token });
});

router.get("/protected", passport.authenticate("jwtAccessToken", { session: false }), (req, res) => {
    res.status(200).json({ message: "Protected Route", user: req.user });
});

module.exports = router;
