const express = require("express");
const passport = require("passport");

const messageRouter = require("./messages");
const router = express.Router();

const { show } = require("../controllers/chatsController");

router.use("/:chatId/messages", messageRouter);
router.get("/:id", passport.authenticate("jwtAccessToken", { session: false }), show);

module.exports = router;
