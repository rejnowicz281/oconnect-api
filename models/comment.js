const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            maxlength: 200,
            trim: true,
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Comment", commentSchema);
