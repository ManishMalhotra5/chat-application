import { User } from "../models/user.model.mjs";
import ApiError from "../utils/ApiError.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";
import jwt from "jsonwebtoken";
const verifyJWT = asyncHandler(async (req, _, next) => {
	try {
        const token =
        		req.cookies?.accessToken ||
        		req.header("Authorization").replace("Bearer ", "");
        	if (!token) {
        		throw new ApiError(403, "Token not found");
        	}
        	const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        
        	if (!decoded) {
        		throw new ApiError(403, "Unauthorized request token missmatch");
        	}
        
        	const user = await User.findById(decoded._id).select(
        		"-password -refreshToken"
        	);
        	if (!user) {
        		throw new ApiError(
        			403,
        			"Unauthorized request : user with given token not found"
        		);
        	}
        
        	req.user = user;
        
        	next();
    } catch (error) {
        throw new ApiError(500,"Failed to verify token "+error);
    }
});
