const debug = require("debug")("app:friendshipController");
const Invite = require("../models/invite");
const Friendship = require("../models/friendship");
const Chat = require("../models/chat");
const asyncHandler = require("../asyncHandler");
const createError = require("http-errors");

exports.index = asyncHandler(async (req, res, next) => {
    // Get all friendships of current user
    const friendships = await Friendship.find({ $or: [{ user1: req.user._id }, { user2: req.user._id }] })
        .populate("user1", "first_name last_name avatar")
        .populate("user2", "first_name last_name avatar");

    // Get all friends of current user, with their friendship_id and the friendship's chat_id
    const friends = friendships.map((friendship) => {
        let friend;
        if (friendship.user1.equals(req.user._id)) friend = friendship.user2;
        else friend = friendship.user1;
        return {
            info: friend,
            friendship_id: friendship._id,
            chat_id: friendship.chat,
        };
    });

    const data = {
        message: "Friendship Index",
        friends,
    };
    debug(data);
    res.status(200).json(data);
});

exports.create = asyncHandler(async (req, res, next) => {
    const invite_id = req.body.invite_id;

    // Check if invite with invite_id exists
    const invite = await Invite.findById(invite_id);
    if (!invite) throw createError(404, "Invite not found");

    // If the invitee is not the current user, return 403 Forbidden (can't accept invites for other users)
    if (!invite.invitee.equals(req.user._id)) throw createError(403, "You can't accept invites for other users");

    // Check if there already exists a friendship between the two users (inviter and invitee)
    const friendship_exists = await Friendship.findOne({
        $or: [
            { user1: invite.invitee, user2: invite.inviter },
            { user1: invite.inviter, user2: invite.invitee },
        ],
    });
    if (friendship_exists) throw createError(400, "Friendship already exists");

    // create a chat for the two users
    const chat = await Chat.create({ users: [invite.inviter, invite.invitee] });

    const friendship = await Friendship.create({ user1: invite.inviter, user2: invite.invitee, chat: chat._id });

    await Invite.findByIdAndDelete(invite_id);

    const data = {
        message: "Friendship Created",
        friendship,
    };
    debug(data);
    res.status(201).json(data);
});

exports.destroy = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const friendship = await Friendship.findById(id);

    if (!friendship) throw createError(404, "Friendship not found");

    // If the current user is not one of the users in the friendship, return 403 Forbidden (can't delete friendships of other users)
    if (!friendship.user1.equals(req.user._id) && !friendship.user2.equals(req.user._id)) return res.sendStatus(403);

    // Delete the chat associated with the friendship
    await Chat.findOneAndDelete({ id: friendship.chat });

    await Friendship.findByIdAndDelete(id);

    const data = {
        message: "Friendship Deleted",
        friendship,
    };
    debug(data);
    res.status(200).json(data);
});
