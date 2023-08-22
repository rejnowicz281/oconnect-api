const express = require("express");
const passport = require("passport");

const router = express.Router({ mergeParams: true });

const { create, destroy } = require("../controllers/messagesController");

router.post("/", passport.authenticate("jwtAccessToken", { session: false }), create);
router.delete("/:id", passport.authenticate("jwtAccessToken", { session: false }), destroy);

module.exports = router;
