const express = require("express");
const passport = require("passport");
const router = express.Router();

const { create, destroy, indexInvitesReceived, indexInvitesSent } = require("../controllers/invitesController");

router.get("/sent", passport.authenticate("jwt", { session: false }), indexInvitesSent);
router.get("/received", passport.authenticate("jwt", { session: false }), indexInvitesReceived);
router.post("/", passport.authenticate("jwt", { session: false }), create);
router.delete("/:id", passport.authenticate("jwt", { session: false }), destroy);

module.exports = router;
