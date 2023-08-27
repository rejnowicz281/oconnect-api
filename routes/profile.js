const express = require("express");
const passport = require("passport");

const router = express.Router();

const { updateAvatar } = require("../controllers/profileController");

router.patch("/avatar", passport.authenticate("jwtAccessToken", { session: false }), updateAvatar);

module.exports = router;
