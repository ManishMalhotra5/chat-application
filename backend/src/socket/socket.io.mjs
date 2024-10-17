import http from "http";
import app from "../app.mjs";
import { Server } from "socket.io";

import { acceptRequest, sendMessage, sendRequest } from "../socket/socket.controllers.mjs"
const server = http.createServer(app);

const io = new Server(server);

io.on("connection", socket => {
    console.log(socket.id + "connected");

    socket.on("join", (user) => {
        socket.user = user;
    });

    socket.on("send_request",sendRequest(username));
    socket.on("accept_request",acceptRequest(username));
    socket.on("send_message",sendMessage(message))
    
})

export default server;