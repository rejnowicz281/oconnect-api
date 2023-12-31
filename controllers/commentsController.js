const debug = require("debug")("app:commentsController");
const asyncHandler = require("../asyncHandler");
const createError = require("http-errors");

const Comment = require("../models/comment");
const Post = require("../models/post");

const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) throw createError(404, "Post not found");

    const comments = await Comment.find({ post: postId }).populate("user", "first_name last_name avatar");

    const data = {
        message: `Comments Index for Post ${postId}`,
        comments,
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

        const postId = req.params.postId;

        const post = await Post.findById(postId);

        if (!post) throw createError(404, "Post not found");

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

    if (!post) throw createError(404, "Post not found");

    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if (!comment) throw createError(404, "Comment not found");

    // only let the user who created the comment or the user who created the post delete the comment - else return 403 Forbidden
    if (!comment.user.equals(req.user._id) && !post.user.equals(req.user._id))
        throw createError(403, "You are not authorized to delete this comment");

    await Comment.findByIdAndDelete(commentId);

    const data = {
        message: "Comment deleted",
        commentId,
    };
    debug(data);
    res.status(200).json(data);
});
