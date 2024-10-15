import dotenv from "dotenv";
import connectDB from "./db/connectDB.mjs";
import server from "./socket/socket.io.mjs";
dotenv.config();

const PORT = process.env.PORT;
connectDB()
.then(()=>{
    console.log("Connecting to Server...")
    server.listen(PORT,()=>{
        console.log("Server connected at ",PORT);
    })
})
.catch((error) =>{
    console.log("Failed to start Server "+ error);
})