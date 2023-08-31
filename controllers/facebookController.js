const refreshTokenOptions = require("../helpers/refreshTokenOptions");
const { generateAccessToken, generateRefreshToken } = require("../helpers/generateTokens");

exports.facebookLogin = async (req, res, next) => {
    const refresh_token = generateRefreshToken(req.user._id);
    const access_token = generateAccessToken(req.user);

    res.cookie("refresh_token", refresh_token, refreshTokenOptions)
        .status(200)
        .json({ message: "Facebook Login Successful", access_token });
};
