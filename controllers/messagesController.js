const debug = require("debug")("app:messagesController");

const Chat = require("../models/chat");
const Message = require("../models/message");

const asyncHandler = require("../asyncHandler");

const { body, validationResult } = require("express-validator");

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

        const message = new Message({
            text: req.body.text,
            user: {
                _id: req.user._id,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                avatar: req.user.avatar,
            },
        });

        const chatId = req.params.chatId;

        const chat = await Chat.findById(chatId);

        if (!chat) throw new Error("Chat not found");

        if (!chat.users.some((user) => user.equals(req.user._id))) {
            const error = new Error("You are not authorized to send messages in this chat");
            error.status = 403;
            throw error;
        }

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

    if (!chat) throw new Error("Chat not found");

    if (!chat.users.some((user) => user.equals(req.user._id))) {
        const error = new Error("You are not authorized to delete messages in this chat");
        error.status = 403;
        throw error;
    }

    const id = req.params.id;

    if (!chat.messages.id(id)) throw new Error("Message not found");

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

    const data = {
        message: "Message destroyed successfully",
        chatId,
        messageId: id,
    };

    debug(data);
    res.json(data);
});
