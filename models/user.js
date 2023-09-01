const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
    },
    first_name: {
        type: String,
        required: true,
        trim: true,
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        url: String,
        fileId: String,
    },
    provider: {
        type: String,
    },
    subject: {
        type: String,
    },
});

module.exports = mongoose.model("User", userSchema);
