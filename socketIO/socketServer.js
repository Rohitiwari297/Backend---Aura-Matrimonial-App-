import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

export const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    console.log("JOIN EVENT HIT:", userId);
    onlineUsers.set(userId.toString(), socket.id);
    console.log("ONLINE USERS:", onlineUsers);
  });
});


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  //  userId yahin se aayega
  const userId = socket.handshake.query.userId;

  if (userId) {
    onlineUsers.set(userId.toString(), socket.id);
    console.log("USER ADDED:", userId, socket.id);
  }

  console.log("ONLINE USERS:", onlineUsers);

  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId.toString());
      console.log("USER DISCONNECTED:", userId);
    }
  });
});

export { app, io, server };
