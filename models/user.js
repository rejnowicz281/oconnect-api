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

// Capitalize first letter of first and last name
userSchema.pre("save", function (next) {
    this.first_name = this.first_name.charAt(0).toUpperCase() + this.first_name.slice(1);
    this.last_name = this.last_name.charAt(0).toUpperCase() + this.last_name.slice(1);
    next();
});

module.exports = mongoose.model("User", userSchema);
