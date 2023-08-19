const debug = require("debug")("app:friendshipController");
const Invite = require("../models/invite");
const Friendship = require("../models/friendship");
const asyncHandler = require("../asyncHandler");
const User = require("../models/user");

exports.index = asyncHandler(async (req, res, next) => {
    const friendships = await Friendship.find({ $or: [{ user1: req.user._id }, { user2: req.user._id }] }); // Find all friendships where the user is either user1 or user2

    const data = {
        message: "Friendship Index",
        friendships,
    };
    debug(data);
    res.status(200).json(data);
});

exports.create = asyncHandler(async (req, res, next) => {
    const invite_id = req.body.invite_id;

    const invite = await Invite.findById(invite_id);

    if (!invite) throw new Error("You have not been invited to be friends with this user");

    if (!invite.invitee.equals(req.user._id)) return res.sendStatus(403); // If the invitee is not the current user, return 403 Forbidden

    const friendship = await Friendship.create({ user1: invite.inviter, user2: invite.invitee });

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

    if (!friendship) throw new Error("Friendship not found");

    if (!friendship.user1.equals(req.user._id) && !friendship.user2.equals(req.user._id)) return res.sendStatus(403);

    await Friendship.findByIdAndDelete(id);

    const data = {
        message: "Friendship Deleted",
        friendship,
    };
    debug(data);
    res.status(200).json(data);
});
