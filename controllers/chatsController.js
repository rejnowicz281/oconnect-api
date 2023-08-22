const debug = require("debug")("app:chatsController");
const asyncHandler = require("../asyncHandler");

const Chat = require("../models/chat");

exports.show = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const chat = await Chat.findById(id)
        .populate("users", "first_name last_name avatar")
        .populate("messages.user", "first_name last_name avatar");

    if (!chat) {
        const error = new Error("Chat not found");
        error.status = 404;
        throw error;
    }

    if (!chat.users.some((user) => user.equals(req.user._id))) {
        const error = new Error("You are not authorized to view this chat");
        error.status = 403;
        throw error;
    }

    const data = {
        message: "Chat found",
        chat,
    };
    debug(data);
    res.status(200).json(data);
});
