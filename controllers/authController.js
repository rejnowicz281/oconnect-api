const generateAccessToken = require("../helpers/generateAccessToken");
const debug = require("debug")("app:authController");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const asyncHandler = require("../asyncHandler");

const generateImageKitObject = require("../helpers/generateImageKitObject");
const imagekit = require("../imagekit");
const { body, validationResult } = require("express-validator");

exports.register = [
    body("email")
        .trim()
        .isLength({ min: 1 })
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

        if (req.files?.avatar?.mimetype.startsWith("image")) avatar = await generateImageKitObject(req.files.avatar);

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

        const token = generateAccessToken(user);

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 12 * 60 * 60 * 1000, // 12 hours
        })
            .status(200)
            .json({ message: "Register Successful" });
    }),
];

exports.login = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const validPassword = bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) throw err;
        return result;
    });

    if (!validPassword) return res.status(401).json({ message: "Invalid email or password" });

    const token = generateAccessToken(user);

    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
    })
        .status(200)
        .json({ message: "Login Successful" });
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
            avatar: process.env.DEFAULT_AVATAR_URL,
        });
        await user.save();
    }

    const token = generateAccessToken(user);

    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
    })
        .status(200)
        .json({ message: "Demo Login Successful" });
});

exports.logout = asyncHandler(async (req, res, next) => {
    return res.clearCookie("access_token").status(200).json({ message: "Logout Successful" });
});
