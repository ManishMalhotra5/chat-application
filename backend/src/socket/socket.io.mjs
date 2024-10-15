import http from "http";
import app from "../app.mjs";
import {Server} from "socket.io";

const server = http.createServer(app);

const io = new Server(server);

io.on("connection", socket => {
    console.log(socket.id + "connected");
})

export default server;