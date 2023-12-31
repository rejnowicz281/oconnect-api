const debug = require("debug")("app:postsController");
const asyncHandler = require("../asyncHandler");
const createError = require("http-errors");

const Post = require("../models/post");
const Friendship = require("../models/friendship");
const Comment = require("../models/comment");

const { body, validationResult } = require("express-validator");
const generateImageKitObject = require("../helpers/generateImageKitObject");
const imagekit = require("../imagekit");

exports.index = asyncHandler(async (req, res, next) => {
    // Get all friendships of current user
    const friendships = await Friendship.find({
        $or: [{ user1: req.user.id }, { user2: req.user.id }],
    });

    // Get all friends of current user in the 'users' array
    const users = friendships.map((friendship) => {
        if (friendship.user1.equals(req.user._id)) return friendship.user2;
        else return friendship.user1;
    });

    // Add current user to 'users'
    users.push(req.user._id);

    // Get all posts of the users in the 'users' array (current user and friends)
    const posts = await Post.find({
        user: { $in: users },
    })
        .populate("user", "first_name last_name avatar")
        .sort({ createdAt: -1 });

    const data = {
        message: "Posts Index",
        posts,
    };
    debug(data);
    res.status(200).json(data);
});

exports.create = [
    body("text")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Text is required")
        .isLength({ max: 200 })
        .withMessage("Post is too long"),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        let photo;
        if (req.files?.photo?.mimetype.startsWith("image"))
            photo = await generateImageKitObject(req.files.photo, "oconnect/posts");

        const post = await new Post({
            text: req.body.text,
            user: req.user._id,
            photo,
        }).populate("user", "first_name last_name avatar");

        await post.save();

        const data = {
            message: "Post created",
            post,
        };
        debug(data);
        res.status(201).json(data);
    }),
];

exports.update = [
    body("text")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Text is required")
        .isLength({ max: 200 })
        .withMessage("Post is too long"),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const id = req.params.id;

        const post = await Post.findById(id);

        if (!post) throw createError(404, "Post not found");

        if (!post.user.equals(req.user._id)) throw createError(403, "You are not authorized to update this post");

        // if req.files.photo exists, update photo and delete old photo from imagekit
        let photo;
        if (req.files?.photo?.mimetype.startsWith("image")) {
            if (post.photo?.fileId) {
                imagekit
                    .deleteFile(post.photo.fileId)
                    .then((result) => {
                        debug(`Imagekit: Image ${post.photo.fileId} deleted`);
                    })
                    .catch((err) => {
                        debug(err);
                    });
            }

            photo = await generateImageKitObject(req.files.photo, "/oconnect/posts");
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {
                text: req.body.text,
                photo: photo || post.photo,
            },
            { new: true }
        ).populate("user", "first_name last_name avatar");

        const data = {
            message: "Post updated",
            post: updatedPost,
        };
        debug(data);
        res.status(200).json(data);
    }),
];

exports.like = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const post = await Post.findById(id);

    if (!post) throw createError(404, "Post not found");

    // if user has already liked post, unlike post, else like post
    if (post.likes.includes(req.user._id)) {
        await Post.findByIdAndUpdate(id, {
            $pull: { likes: req.user._id },
        });
        res.status(200).json({ message: `Post ${id} unliked` });
    } else {
        await Post.findByIdAndUpdate(id, {
            $push: { likes: req.user._id },
        });
        res.status(200).json({ message: `Post ${id} liked` });
    }
});

exports.destroy = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const post = await Post.findById(id);

    if (!post) throw createError(404, "Post not found");

    if (!post.user.equals(req.user._id)) throw createError(403, "You are not authorized to delete this post");

    // if post has photo, delete it from imagekit
    if (post.photo?.fileId) {
        imagekit
            .deleteFile(post.photo.fileId)
            .then((result) => {
                debug(`Imagekit: Image ${post.photo.fileId} deleted`);
            })
            .catch((err) => {
                debug(err);
            });
    }

    // delete all comments of post
    await Comment.deleteMany({ post: id });

    await Post.findByIdAndDelete(id);

    const data = {
        message: "Post deleted",
        postId: id,
    };
    debug(data);
    res.status(200).json(data);
});
