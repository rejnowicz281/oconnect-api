const debug = require("debug")("app:chatsController");
const asyncHandler = require("../asyncHandler");
const createError = require("http-errors");

const Chat = require("../models/chat");

exports.show = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const chat = await Chat.findById(id)
        .populate("users", "first_name last_name avatar")
        .populate("messages.user", "first_name last_name avatar");

    if (!chat) throw createError(404, "Chat not found");

    if (!chat.users.some((user) => user.equals(req.user._id)))
        throw createError(403, "You are not authorized to view this chat");

    const otherUser = chat.users.find((user) => !user._id.equals(req.user._id));

    const data = {
        message: "Chat found",
        chat: {
            _id: chat._id,
            other_user: otherUser,
            messages: chat.messages,
        },
    };
    debug(data);
    res.status(200).json(data);
});
