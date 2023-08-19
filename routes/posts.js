const express = require("express");
const passport = require("passport");

const commentRouter = require("./comments");
const router = express.Router();

const { index, create, update, destroy, like } = require("../controllers/postsController");

router.use("/:postId/comments", commentRouter);
router.get("/", passport.authenticate("jwt", { session: false }), index);
router.post("/", passport.authenticate("jwt", { session: false }), create);
router.put("/:id", passport.authenticate("jwt", { session: false }), update);
router.delete("/:id", passport.authenticate("jwt", { session: false }), destroy);
router.patch("/:id/like", passport.authenticate("jwt", { session: false }), like);

module.exports = router;
