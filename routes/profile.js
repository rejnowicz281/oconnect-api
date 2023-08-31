const express = require("express");
const passport = require("passport");

const router = express.Router();

const { updateAvatar, resetAvatar } = require("../controllers/profileController");

router.patch("/avatar/reset", passport.authenticate("jwtAccessToken", { session: false }), resetAvatar);
router.patch("/avatar", passport.authenticate("jwtAccessToken", { session: false }), updateAvatar);

module.exports = router;
