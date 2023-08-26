const debug = require("debug")("app:invitesController");
const Invite = require("../models/invite");
const Friendship = require("../models/friendship");
const asyncHandler = require("../asyncHandler");
const User = require("../models/user");

exports.indexInvitesReceived = asyncHandler(async (req, res, next) => {
    const invitesReceived = await Invite.find({ invitee: req.user._id }).populate(
        "inviter",
        "first_name last_name avatar"
    );

    const data = { message: "Invites Received", invitesReceived };
    debug(data);
    res.status(200).json(data);
});

exports.create = asyncHandler(async (req, res, next) => {
    const invitee_id = req.body.invitee_id;
    if (invitee_id == req.user._id) throw new Error("You cannot invite yourself");

    // Find invites where inviter is current user and invitee is invitee_id
    const invite_exists = await Invite.findOne({ inviter: req.user._id, invitee: invitee_id });
    if (invite_exists) throw new Error("You already invited this user");

    // Check if invitee exists
    const invitee = await User.findById(invitee_id);
    if (!invitee) throw new Error("Invitee not found");

    // Check if invitee is already invited
    const inviteeInvited = await Invite.findOne({ inviter: req.user._id, invitee: invitee_id });
    if (inviteeInvited) throw new Error("Invitee already invited");

    // Check if invitee has already invited the inviter
    const inviterInvited = await Invite.findOne({ inviter: invitee_id, invitee: req.user._id });
    if (inviterInvited) throw new Error("Invitee has already invited you");

    // Check if invitee is already friends with the inviter
    const friendship = await Friendship.findOne({
        $or: [
            { user1: req.user._id, user2: invitee_id },
            { user1: invitee_id, user2: req.user._id },
        ],
    });
    if (friendship) throw new Error("Invitee is already friends with you");

    const invite = await Invite.create({ inviter: req.user._id, invitee: invitee_id });

    const data = { message: "Invite Created", invite };
    debug(data);
    res.status(201).json(data);
});

exports.destroy = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const invite = await Invite.findById(id);

    if (!invite) throw new Error("Invite not found");

    if (!invite.inviter.equals(req.user._id) && !invite.invitee.equals(req.user._id)) return res.sendStatus(403);

    await Invite.findByIdAndDelete(id);
    const data = { message: "Invite Deleted", invite };
    debug(data);
    res.status(200).json(data);
});
