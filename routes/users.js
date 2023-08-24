const express = require("express");
const passport = require("passport");

const router = express.Router();

const { index, show } = require("../controllers/usersController");

router.get("/", passport.authenticate("jwtAccessToken", { session: false }), index);
router.get("/:id", passport.authenticate("jwtAccessToken", { session: false }), show);

module.exports = router;
