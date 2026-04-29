import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://video-watchparty.vercel.app",
  "https://video-watchparty-epnz6d4b3-sofaspawns-projects.vercel.app"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Broadcast video state changes to all other connected clients
  socket.on("video-state-change", (data) => {
    console.log("Video state change:", data);
    socket.broadcast.emit("video-state-change", data);
  });

  // Broadcast video seek to all other connected clients
  socket.on("video-seek", (data) => {
    console.log("Video seek:", data);
    socket.broadcast.emit("video-seek", data);
  });

  // Broadcast video load to all other connected clients
  socket.on("video-load", (data) => {
    console.log("Video load:", data);
    socket.broadcast.emit("video-load", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});