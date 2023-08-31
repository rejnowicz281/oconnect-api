const debug = require("debug")("app:authController");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const asyncHandler = require("../asyncHandler");
const { generateAccessToken, generateRefreshToken } = require("../helpers/generateTokens");
const refreshTokenOptions = require("../helpers/refreshTokenOptions");

const generateImageKitObject = require("../helpers/generateImageKitObject");
const { body, validationResult } = require("express-validator");

exports.register = [
    body("email")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Email must not be empty")
        .isEmail()
        .withMessage("Email must be a valid email address")
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            if (user) throw new Error("An account with that email already exists");
            return true;
        }),
    body("first_name", "First Name must not be empty").trim().isLength({ min: 1 }),
    body("last_name", "Last Name must not be empty").trim().isLength({ min: 1 }),
    body("password", "Password must not be empty").trim().isLength({ min: 1 }),
    body("password_confirm").custom((value, { req }) => {
        if (value !== req.body.password) throw new Error("Passwords do not match");
        return true;
    }),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        let avatar;

        if (req.files?.avatar?.mimetype.startsWith("image"))
            avatar = await generateImageKitObject(req.files.avatar, "oconnect/avatars", true);

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const userData = {
            email: req.body.email,
            password: hashedPassword,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            avatar: avatar || { url: process.env.DEFAULT_AVATAR_URL },
        };

        const user = new User(userData);

        await user.save();

        const refresh_token = generateRefreshToken(user._id);
        const access_token = generateAccessToken(user);

        res.cookie("refresh_token", refresh_token, refreshTokenOptions)
            .status(200)
            .json({ message: "Register Successful", access_token });
    }),
];

exports.login = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const validPassword = bcrypt.compare(req.body.password, user.password);

    if (!validPassword) return res.status(401).json({ message: "Invalid email or password" });

    const refresh_token = generateRefreshToken(user._id);
    const access_token = generateAccessToken(user);

    res.cookie("refresh_token", refresh_token, refreshTokenOptions)
        .status(200)
        .json({ message: "Login Successful", access_token });
});

exports.demoLogin = asyncHandler(async (req, res, next) => {
    let user = await User.findOne({ email: "demo@gmail.com" });

    if (!user) {
        debug("Demo user not found, creating new demo user...");
        user = new User({
            email: "demo@gmail.com",
            password: 123,
            first_name: "Demo",
            last_name: "User",
            avatar: { url: process.env.DEFAULT_AVATAR_URL },
        });
        await user.save();
    }

    const refresh_token = generateRefreshToken(user._id);
    const access_token = generateAccessToken(user);

    res.cookie("refresh_token", refresh_token, refreshTokenOptions)
        .status(200)
        .json({ message: "Demo Login Successful", access_token });
});

exports.logout = asyncHandler(async (req, res, next) => {
    return res.clearCookie("refresh_token").status(200).json({ message: "Logout Successful" });
});
