const express = require("express");
const passport = require("passport");

const router = express.Router();

const { register, login, logout, demoLogin } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/demo", demoLogin);
router.post("/logout", logout);
router.get("/protected", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.status(200).json({ message: "Protected Route", user: req.user.email });
});

module.exports = router;
