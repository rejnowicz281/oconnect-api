const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const friendshipSchema = new Schema({
    user1: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    user2: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

module.exports = mongoose.model("Friendship", friendshipSchema);
