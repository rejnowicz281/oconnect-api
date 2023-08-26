const debug = require("debug")("app:usersController");
const asyncHandler = require("../asyncHandler");
const Friendship = require("../models/friendship");
const Invite = require("../models/invite");
const User = require("../models/user");
const Post = require("../models/post");

exports.index = asyncHandler(async (req, res, next) => {
    const friendships = await Friendship.find({
        $or: [{ user1: req.user._id }, { user2: req.user._id }],
    }).select("user1 user2");

    // Get current user's friends
    const friends = friendships.map((friendship) => {
        return friendship.user1.equals(req.user._id) ? friendship.user2 : friendship.user1;
    });

    // Get current user's received invites
    const invitesReceived = await Invite.find({ invitee: req.user._id }).select("inviter");

    // Get users that have not invited the current user and that current user is not friends with
    const users = await User.find({
        $and: [
            { _id: { $nin: friends } },
            { _id: { $ne: req.user._id } },
            { _id: { $nin: invitesReceived.map((invite) => invite.inviter) } },
        ],
    }).select("first_name last_name avatar");

    // Get current user's sent invites
    const invitesSent = await Invite.find({ inviter: req.user._id }).select("invitee");

    // Add invite_id property to users
    const finalUsers = users.map((user) => {
        const invite = invitesSent.find((invite) => invite.invitee.equals(user._id));
        return {
            ...user._doc,
            invite_id: invite ? invite._id : null,
        };
    });

    const data = {
        message: "Users Index",
        users: finalUsers,
    };
    debug("Users Index Successful");
    res.status(200).json(data);
});

exports.show = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const user = await User.findById(id).select("first_name last_name avatar");

    if (!user) throw new Error("User not found");

    // Get user's friends
    const friendships = await Friendship.find({
        $or: [{ user1: user._id }, { user2: user._id }],
    })
        .select("user1 user2")
        .populate("user1 user2", "first_name last_name avatar");

    const friends = friendships.map((friendship) => {
        return friendship.user1.equals(user._id) ? friendship.user2 : friendship.user1;
    });

    // Get user's posts, sort by newest first
    const posts = await Post.find({ user: user._id })
        .populate("user", "first_name last_name avatar")
        .sort({ createdAt: -1 });

    const data = {
        message: "User Show",
        user: {
            ...user._doc,
            friends,
            posts,
        },
    };
    debug(data);
    res.status(200).json(data);
});
