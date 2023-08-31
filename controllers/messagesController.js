const debug = require("debug")("app:messagesController");

const Chat = require("../models/chat");
const Message = require("../models/message");

const asyncHandler = require("../asyncHandler");

const { body, validationResult } = require("express-validator");
const { create } = require("../models/user");

exports.create = [
    body("text")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please enter a message")
        .isLength({ max: 160 })
        .withMessage("Message is too long"),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        const message = await new Message({
            text: req.body.text,
            user: req.user._id,
        }).populate("user", "first_name last_name avatar");

        const chatId = req.params.chatId;

        const chat = await Chat.findById(chatId);

        if (!chat) throw createError(404, "Chat not found");

        if (!chat.users.some((user) => user.equals(req.user._id)))
            throw createError(403, "You are not authorized to send messages in this chat");

        await Chat.updateOne(
            {
                _id: chatId,
            },
            {
                $push: {
                    messages: message,
                },
            }
        );

        const io = req.app.get("socketio");

        // emit creation of message to all users in chat
        io.to(chatId).emit("addMessage", message);
        const data = {
            message: "Message created",
            chatId,
            messageBody: message,
        };
        debug(data);
        res.json(data);
    }),
];

exports.destroy = asyncHandler(async (req, res, next) => {
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId);

    if (!chat) throw createError(404, "Chat not found");

    if (!chat.users.some((user) => user.equals(req.user._id)))
        throw createError(403, "You are not authorized to delete messages in this chat");

    const id = req.params.id;

    if (!chat.messages.id(id)) throw createError(404, "Message not found");

    await Chat.updateOne(
        {
            _id: chatId,
        },
        {
            $pull: {
                messages: {
                    _id: id,
                },
            },
        }
    );

    const io = req.app.get("socketio");

    // emit deletion of message to all users in chat
    io.to(chatId).emit("removeMessage", id);

    const data = {
        message: "Message destroyed successfully",
        chatId,
        messageId: id,
    };

    debug(data);
    res.json(data);
});
