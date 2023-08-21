const debug = require("debug")("app:usersController");
const asyncHandler = require("../asyncHandler");
const User = require("../models/user");

exports.index = asyncHandler(async (req, res, next) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("first_name last_name avatar");

    const data = {
        message: "Users Index",
        users,
    };
    debug(data);
    res.status(200).json(data);
});
