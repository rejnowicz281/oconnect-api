const debug = require("debug")("app:invitesController");
const Invite = require("../models/invite");
const asyncHandler = require("../asyncHandler");
const User = require("../models/user");

exports.indexInvitesSent = asyncHandler(async (req, res, next) => {
    const invitesSent = await Invite.find({ inviter: req.user._id });

    res.status(200).json({ message: "Invites Sent", invitesSent });
});

exports.indexInvitesReceived = asyncHandler(async (req, res, next) => {
    const invitesReceived = await Invite.find({ invitee: req.user._id });

    res.status(200).json({ message: "Invites Received", invitesReceived });
});

exports.create = asyncHandler(async (req, res, next) => {
    const invitee_id = req.body.invitee_id;

    if (invitee_id == req.user._id) throw new Error("You cannot invite yourself");

    const invitee = await User.findById(invitee_id);

    if (!invitee) throw new Error("Invitee not found");

    // Check if invitee is already invited
    const inviteeInvited = await Invite.findOne({ inviter: req.user._id, invitee: invitee_id });

    if (inviteeInvited) throw new Error("Invitee already invited");

    // Check if invitee has already invited the inviter
    const inviterInvited = await Invite.findOne({ inviter: invitee_id, invitee: req.user._id });

    if (inviterInvited) throw new Error("Invitee has already invited you");

    const invite = await Invite.create({ inviter: req.user._id, invitee: invitee_id });

    res.status(201).json({ message: "Invite Created", invite });
});

exports.destroy = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const invite = await Invite.findById(id);

    if (!invite) throw new Error("Invite not found");

    if (!invite.inviter.equals(req.user._id) && !invite.invitee.equals(req.user._id)) return res.sendStatus(403);

    await Invite.findByIdAndDelete(id);

    res.status(200).json({ message: "Invite Deleted", invite });
});
