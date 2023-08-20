if (process.env.NODE_ENV !== "production") require("dotenv").config();

// const rateLimit = require("express-rate-limit");
const compression = require("compression");
const debug = require("debug")("app:db");
const express = require("express");
const helmet = require("helmet");
const createError = require("http-errors");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");

const authRouter = require("./routes/auth");
const inviteRouter = require("./routes/invites");
const friendshipRouter = require("./routes/friendship");
const postRouter = require("./routes/posts");

const app = express();

// connect to mongodb && listen for requests
const URI = process.env.MONGOD_URI;

mongoose
    .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const server = app.listen(3000);

        debug("Connected to DB");
        debug(server.address());
    })
    .catch((err) => {
        debug(err);
    });

// passport config
require("./helpers/passportConfig");

// middleware and static files
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(
    fileupload({
        limits: { fileSize: 20 * 1024 * 1024 },
        abortOnLimit: true,
    })
);
// app.use(
//     rateLimit({
//         windowMs: 1 * 60 * 1000, // 1 minute
//         max: 200,
//     })
// );

// routes
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use(authRouter);
app.use("/invites", inviteRouter);
app.use("/friendships", friendshipRouter);
app.use("/posts", postRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    debug(err);

    let error = { message: err.message, status: err.status };

    if (req.app.get("env") === "development") error.stack = err.stack;

    res.status(err.status || 500).json({ error });
});
