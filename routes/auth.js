const express = require("express");
const passport = require("passport");
const generateAccessToken = require("../helpers/generateAccessToken");

const router = express.Router();

const { register, login, logout, demoLogin } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/demo", demoLogin);
router.post("/logout", logout);
router.post("/facebook", passport.authenticate("facebook-token", { session: false }), (req, res) => {
    const token = generateAccessToken(req.user);

    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
    })
        .status(200)
        .json({ message: "Facebook Login Successful" });
});
router.get("/protected", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.status(200).json({ message: "Protected Route", user: req.user });
});

module.exports = router;
