const mongoose = require("mongoose");

const messageSchema = require("./message").schema;
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    messages: [messageSchema],
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

module.exports = mongoose.model("Chat", chatSchema);
