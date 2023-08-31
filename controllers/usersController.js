const debug = require("debug")("app:usersController");
const asyncHandler = require("../asyncHandler");
const Friendship = require("../models/friendship");
const Invite = require("../models/invite");
const User = require("../models/user");
const Post = require("../models/post");
const createError = require("http-errors");

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

    // Add invite_id property to users - if current user has sent an invite to a user, add invite_id to the user object, else add null
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

    if (!user) throw createError(404, "User not found");

    const [friendships, posts, invitesReceived, invitesSent] = await Promise.all([
        // Get this user's friendships
        Friendship.find({
            $or: [{ user1: id }, { user2: id }],
        }).populate("user1 user2", "first_name last_name avatar"),

        // Get this user's posts, sort by newest first
        Post.find({ user: id }).populate("user", "first_name last_name avatar").sort({ createdAt: -1 }),

        // Get current user's received invites
        Invite.find({ invitee: req.user._id }).select("inviter"),

        // Get current user's sent invites
        Invite.find({ inviter: req.user._id }).select("invitee"),
    ]);

    // Get this user's friends
    const friends = friendships.map((friendship) => {
        return friendship.user1.equals(user._id) ? friendship.user2 : friendship.user1;
    });

    // Current user's received invite where this user is the inviter
    const invited_me = invitesReceived.find((invite) => invite.inviter.equals(user._id));

    // Current user's sent invite where this user is the invitee
    const is_invited = invitesSent.find((invite) => invite.invitee.equals(user._id));

    // If invited_me (current user was invited by this user) or is_invited(current user invited this user), get that invite's id
    const invite_id = invited_me ? invited_me._id : is_invited ? is_invited._id : null;

    // Find current user's friendship with this user
    const friendship = friendships.find((friendship) => {
        return (
            (friendship.user1.equals(req.user._id) && friendship.user2.equals(user._id)) ||
            (friendship.user2.equals(req.user._id) && friendship.user1.equals(user._id))
        );
    });

    const data = {
        message: "User Show",
        user: {
            ...user._doc,
            friends,
            posts,
            invite_id,
            friendship_id: friendship ? friendship._id : null,
            chat_id: friendship ? friendship.chat : null,
            invited_me: invited_me ? true : false,
            is_invited: is_invited ? true : false,
        },
    };
    debug(data);
    res.status(200).json(data);
});
