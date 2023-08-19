const debug = require("debug")("app:commentsController");
const asyncHandler = require("../asyncHandler");

const Comment = require("../models/comment");
const Post = require("../models/post");

const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
        const error = new Error("Post not found");
        error.status = 404;
        throw error;
    }

    const comments = await Comment.find({ post: postId }).populate("user", "first_name last_name avatar");

    const data = {
        message: `Comments Index for Post ${postId}`,
        comments,
    };
    debug(data);
    res.status(200).json(data);
});

exports.create = [
    body("text", "Text must not be empty").trim().isLength({ min: 1 }).escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const postId = req.params.postId;

        const post = await Post.findById(postId);

        if (!post) {
            const error = new Error("Post not found");
            error.status = 404;
            throw error;
        }

        const comment = await new Comment({
            text: req.body.text,
            user: req.user._id,
            post: postId,
        }).populate("user", "first_name last_name avatar");

        await comment.save();

        const data = {
            message: "Comment Created",
            comment,
        };
        debug(data);
        res.status(200).json(data);
    }),
];

exports.destroy = asyncHandler(async (req, res, next) => {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
        const error = new Error("Post not found");
        error.status = 404;
        throw error;
    }

    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        const error = new Error("Comment not found");
        error.status = 404;
        throw error;
    }

    // if user is not the owner of the comment or the post
    if (!comment.user.equals(req.user._id) && !post.user.equals(req.user._id)) {
        const error = new Error("You are not authorized to delete this comment");
        error.status = 403;
        throw error;
    }

    await comment.delete();

    const data = {
        message: "Comment deleted",
        commentId,
    };
    debug(data);
    res.status(200).json(data);
});
