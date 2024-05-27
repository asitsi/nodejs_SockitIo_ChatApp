"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const secretKeyJWT = "asdasdsadasdasdasdsa";
const port = 3000;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/login", (req, res) => {
    const token = jsonwebtoken_1.default.sign({ _id: "asdasjdhkasdasdas" }, secretKeyJWT);
    res
        .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
        .json({
        message: "Login Success",
    });
});
io.use((socket, next) => {
    (0, cookie_parser_1.default)()(socket.request, socket.request.res, (err) => {
        if (err)
            return next(err);
        const token = socket.request.cookies.token;
        if (!token)
            return next(new Error("Authentication Error"));
        try {
            jsonwebtoken_1.default.verify(token, secretKeyJWT);
            next();
        }
        catch (error) {
            return next(new Error("Authentication Error"));
        }
    });
});
io.on("connection", (socket) => {
    console.log("User Connected", socket.id);
    socket.on("message", ({ room, message }) => {
        console.log({ room, message });
        socket.to(room).emit("receive-message", message);
    });
    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`);
    });
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
