const debug = require("debug")("app:profileController");
const imagekit = require("../imagekit");
const User = require("../models/user");
const asyncHandler = require("../asyncHandler");
const generateImageKitObject = require("../helpers/generateImageKitObject");

exports.updateAvatar = asyncHandler(async (req, res, next) => {
    let avatar;

    if (req.files?.avatar?.mimetype.startsWith("image")) {
        if (req.user?.avatar?.fileId) {
            imagekit
                .deleteFile(req.user.avatar.fileId)
                .then((result) => {
                    debug(`Imagekit: Image ${req.user.avatar.fileId} deleted`);
                })
                .catch((err) => {
                    debug(err);
                });
        }

        avatar = await generateImageKitObject(req.files.avatar, "oconnect/avatars", true);
    }

    if (!avatar) throw new Error("Please upload an image");

    await User.findByIdAndUpdate(req.user._id, { avatar });

    const data = {
        message: "Avatar updated",
        avatar,
    };
    debug(data);
    res.status(200).json(data);
});
