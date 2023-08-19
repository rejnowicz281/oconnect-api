const express = require("express");

const router = express.Router();

const { register, login, logout, demoLogin } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/demo", demoLogin);
router.post("/logout", logout);

module.exports = router;
