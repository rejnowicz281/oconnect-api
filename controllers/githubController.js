const debug = require("debug")("app:githubController");
const asyncHandler = require("../asyncHandler");
const axios = require("axios");
const queryString = require("query-string");
const createError = require("http-errors");
const refreshTokenOptions = require("../helpers/refreshTokenOptions");
const { generateAccessToken, generateRefreshToken } = require("../helpers/generateTokens");

exports.getAccessToken = asyncHandler(async (req, res, next) => {
    const code = req.body.code;

    const params =
        "?client_id=" +
        process.env.GITHUB_CLIENT_ID +
        "&client_secret=" +
        process.env.GITHUB_CLIENT_SECRET +
        "&code=" +
        code;

    const response = await axios.post("https://github.com/login/oauth/access_token" + params);

    const parsed = queryString.parse(response.data);

    if (!parsed.access_token) throw createError(500, "Error retrieving Github Token");

    const data = {
        message: "Github Token Retrieved",
        token: parsed.access_token,
    };
    debug(data);
    res.status(200).json(data);
});

exports.githubLogin = asyncHandler(async (req, res, next) => {
    const refresh_token = generateRefreshToken(req.user._id);
    const access_token = generateAccessToken(req.user);

    res.cookie("refresh_token", refresh_token, refreshTokenOptions)
        .status(200)
        .json({ message: "Github Login Successful", access_token });
});
