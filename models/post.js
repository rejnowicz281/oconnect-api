const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
            maxlength: 200,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        photo: { url: String, fileId: String },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Post", postSchema);
