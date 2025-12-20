import { Server } from "socket.io";
import http  from 'http'
import express from 'express'

const app = express()

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
})
io.on('connection', (socket)=>{
    console.log('New client connected...', socket.id)

    // Listen for messages from Postman (or frontend)
    socket.on("sendMessage", (data) => {
    console.log(" Message received from client:", data);

    // Optional: send back a confirmation
    socket.emit("messageReceived", {
      success: true,
      receivedData: data,
    });
  });

    socket.on("Disconnected", ()=>{
        console.log('Client disconnected', socket.id)
    })
})




export {app, io, server}

