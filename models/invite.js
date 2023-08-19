const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const inviteSchema = new Schema({
    inviter: {
        // The person who is inviting
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    invitee: {
        // The person who is invited
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

module.exports = mongoose.model("Invite", inviteSchema);
