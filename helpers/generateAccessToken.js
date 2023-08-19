const jwt = require("jsonwebtoken");

module.exports = function generateAccessToken(user) {
    const payload = {
        sub: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });
};
