const express = require("express");
const passport = require("passport");

const router = express.Router({ mergeParams: true });

// const {index, create, destroy} = require("../controllers/commentsController");

// router.get("/", passport.authenticate("jwt", { session: false }), index);
// router.post("/", passport.authenticate("jwt", { session: false }), create);
// router.delete("/:id", passport.authenticate("jwt", { session: false }), destroy);

module.exports = router;
