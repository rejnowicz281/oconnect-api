const debug = require("debug")("app:generateImageKitObject");

const imagekit = require("../imagekit");

module.exports = async function generateImageKitObject(image, folder, avatar = false) {
    const result = await imagekit.upload({
        file: image.data,
        fileName: image.name,
        folder,
    });
    debug("Upload result:", result);
    const object = {
        url: avatar
            ? imagekit.url({
                  src: result.url,
                  transformation: [{ height: 200, width: 200, crop: "force" }],
              })
            : result.url,
        fileId: result.fileId,
    };
    debug("Returning object:", object);
    return object;
};
