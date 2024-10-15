import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender : {
            username :{
                type : String,
                required : true
            }
        },
        receiver : [
            {
                username :{
                    type : String,
                    required : true
                }
            }
        ],
        type : {
            type: String,
            required : true
        },
        
        data : {
            type : String,
            required : true
        }
    },
    {
        timestamps : true
    }
);

export const Message = mongoose.model("Message",messageSchema);