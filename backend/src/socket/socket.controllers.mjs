import ApiError from "../utils/ApiError.mjs";
import { User } from "../models/user.model.mjs";
import { Message } from "../models/message.model.mjs";

const sendRequest = async (socket, username) => {
    try {
        if (!username) {
            throw new ApiError(404, "Empty Username");
        }
        const targetUser = await User.findOne({ username });
        if (!targetUser) {
            throw new ApiError(404, "User not found");
        }
        const reqAlreadyExist = targetUser.requests.some(
            (req) => {
                req.username === socket.user.username
            }
        )
        if (!reqAlreadyExist && !targetUser.friends.some((frnd) => frnd.username === socket.user.username)) {
            targetUser.requests.push({
                username: socket.user.username
            });
        }
        await targetUser.save({ validateBeforeSave: false });
        socket.emit("request sent", "Request sent successfully")
    } catch (error) {
        throw new ApiError(500, "Failed to send request" + error)
    }
}

const acceptRequest = async (username) => {
    try {
        if (!username) {
            throw new ApiError(404, "Empty Username");
        }
        const reqUser = await User.findOne({ username });
        if (!reqUser) {
            throw new ApiError(404, "User not found");
        }
        const currUser = await User.findById(socket.user._id);
        currUser.friends.push({username : reqUser.username});
        reqUser.friends.push({username: currUser.username});

        const index = reqUser.requests.findIndex((req) => req.username === currUser.username);
        if(index < 0){
            throw ApiError(404,"Requested User not found");
        }

        reqUser.requests.splice(index,1);

        await reqUser.save({validateBeforeSave:false});
        await currUser.save({validateBeforeSave:false});

    } catch (error) {
        throw new ApiError(500, "Failed to accept request" + error)
    }
}

const sendMessage = async (socket,onlineUser,data) => {
    try {
        const {sender,receiver,type,data}= data;
        if(!(sender && receiver&& type && data)){
            throw new ApiError(404,"Improper message");
        }
    
        const senderUser = await User.findOne({sender});
        const receiverUser = await User.findOne({receiver});
    
        if(!senderUser){
            throw new ApiError(404,"Sender not Found");
        }
        if(!receiverUser){
            throw new ApiError(404,"Receiver not found");
        }
        const newMessage = await Message.create({
            sender: sender,
            receiver : receiver,
            type : type,
            data : data
        });
    
        senderUser.messages.push(newMessage);
        receiver.messages.push(newMessage);

        if(onlineUser[receiver]){
            socket.to(onlineUser[receiver]).emit("message_received",{data});
        }
    
        await senderUser.save({validateBeforeSave:false});
        await receiverUser.save({validateBeforeSave:false});
    
    } catch (error) {
        throw new ApiError(500,"Failed to send Message");
    }
    

}

const deleteMessage = () => {

}

const blockUser = (username) => {

}

export {
    sendRequest,
    acceptRequest,
    sendMessage
}