const express = require("express");
const passport = require("passport");
const router = express.Router();

const { create, destroy, indexInvitesReceived } = require("../controllers/invitesController");

router.get("/received", passport.authenticate("jwtAccessToken", { session: false }), indexInvitesReceived);
router.post("/", passport.authenticate("jwtAccessToken", { session: false }), create);
router.delete("/:id", passport.authenticate("jwtAccessToken", { session: false }), destroy);

module.exports = router;
