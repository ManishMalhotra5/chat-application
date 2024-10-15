import mongoose from "mongoose";
import { Message } from "./message.model.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: [true, "Sorry, username already exist"],
			lowercase: true,
		},
		firstName: {
			type: String,
			required: [true, "Please enter your first name"],
		},
		lastName: {
			type: String,
		},
		email : {
			type : String,
			required : [true,"Email is required"],
			unique : [true,"Email has to be unique"]
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		profile :{
			type : String
		},
		refreshToken : {
			type : String
		},
		friends: [
			{
				username: {
					type: String,
					required: true,
				},
			},
		],
		messages: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: Message,
			},
		],
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save",async function(next){
	if(!this.isModified(this.password)) return next;
	this.password = await bcrypt.hash(this.password,10);
	next();
})

userSchema.methods.isPasswordCorrect = async function(password){
	return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
	return jwt.sign(
		{
			_id : this._id,
			email : this.email
		},
		process.env.ACCESS_TOKEN_KEY,
		{
			expiresIn:process.env.ACCESS_TOKEN_EX
		}
	);
}

userSchema.methods.generateRefreshToken = function(){
	return jwt.sign(
		{
			_id:this._id
		},
		process.env.REFRESH_TOKEN_KEY,
		{
			expiresIn:process.env.REFRESH_TOKEN_EX
		}
	)
}

export const User = mongoose.model("User",userSchema);
