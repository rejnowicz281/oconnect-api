const { Server } = require("socket.io");
const debug = require("debug")("app:socket");

exports.initSocket = function (server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        debug("a user connected");

        socket.on("joinChat", (chat) => {
            socket.join(chat);
            debug("user joined chat", chat);
        });

        socket.on("leaveChat", (chat) => {
            socket.leave(chat);
            debug("user left chat", chat);
        });
    });

    return io;
};
