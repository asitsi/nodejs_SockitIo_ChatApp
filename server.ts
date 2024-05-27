import express, { Request, Response } from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { Socket } from "socket.io";

const secretKeyJWT = "asdasdsadasdasdasdsa";
const port = 3000;

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/login", (req: Request, res: Response) => {
  const token = jwt.sign({ _id: "asdasjdhkasdasdas" }, secretKeyJWT);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login Success",
    });
});

io.use((socket: Socket, next) => {
  cookieParser()(socket.request as any, (socket.request as any).res, (err: any) => {
    if (err) return next(err);

    const token = (socket.request as any).cookies.token;
    if (!token) return next(new Error("Authentication Error"));

    try {
      jwt.verify(token, secretKeyJWT);
      next();
    } catch (error) {
      return next(new Error("Authentication Error"));
    }
  });
});

io.on("connection", (socket: Socket) => {
  console.log("User Connected", socket.id);

  socket.on("message", ({ room, message }: { room: string; message: string }) => {
    console.log({ room, message });
    socket.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (room: string) => {
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
