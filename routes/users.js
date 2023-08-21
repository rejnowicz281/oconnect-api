const express = require("express");
const passport = require("passport");

const router = express.Router();

const { index } = require("../controllers/usersController");

router.get("/", passport.authenticate("jwtAccessToken", { session: false }), index);

module.exports = router;
