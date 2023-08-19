const debug = require("debug")("app:generateImageKitObject");

const imagekit = require("../imagekit");

module.exports = async function generateImageKitObject(image, folder) {
    const result = await imagekit.upload({
        file: image.data,
        fileName: image.name,
        folder,
    });
    debug("Upload result:", result);
    const object = {
        url: result.url,
        fileId: result.fileId,
    };
    debug("Returning object:", object);
    return object;
};
