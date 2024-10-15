import { User } from "../models/user.model.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";
import ApiError from "../utils/ApiError.mjs";
import ApiResponse from "../utils/ApiResponse.mjs";

const generateTokens = async (userId) => {
	try {
		const user = await User.findById(userId);
		const refreshToken = user.generateRefreshToken();
		const accessToken = user.generateAccessToken();
		user.refreshToken = refreshToken;
		user.save({ validateBeforeSave: false });
		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(500, "Failed to generate tokens " + error);
	}
};

const options = {
	httpOnly: true,
	secure: true,
};

const register = asyncHandler(async (req, res) => {
	const { username, firstName, email, password } = req.body;
	if (!(username && firstName && email && password)) {
		throw new ApiError(404, "Required information not received");
	}
	const userExist = await User.findOne({ email });
	if (userExist) {
		throw new ApiError(402, "User already exists");
	}
	const user = await User.create({
		username: username,
		email: email,
		password: password,
		firstName: firstName,
	});

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Registered successfully"));
});

const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!(email && password)) {
		throw new ApiError(404, "Email and password is required");
	}

	const user = await User.findOne({ email });
	if (!user) {
		throw new ApiError(404, "User with given email doesn't exist");
	}
	const isPasswordValid = user.isPasswordCorrect(password);
	if (!isPasswordValid) {
		throw new ApiError(403, "Wrong Password");
	}
	const { accessToken, refreshToken } = await generateTokens(user._id);
	const loggedUser = await User.findById(user._id).select(
		"-password -refreshtoken "
	);

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(200, { loggedUser }, "User logged in successfully")
		);
});

const logout = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request");
	}
	await User.findByIdAndUpdate(req.user._id, {
		$unset: {
			refreshToken: "",
		},
	});

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponse(200, {}, "User logged out successfully"));
});

const deleteAccount = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request");
	}

	await User.findByIdAndDelete(req.user._id);

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Account deleted successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request");
	}
	if (!req.file) {
		throw new ApiError(404, "Profile not");
	}

	const localFilePath = req.file.path;

	if (!localFilePath) {
		throw new ApiError(500, "Failed to load to profile");
	}

	const profile = await uploadOnCloudinary(localFilePath);

	if (!profile) {
		throw new ApiError(500, "Failed to upload on cloud");
	}

	const user = await User.findById(req.user._id);
	user.profile = profile;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Profile updated successfully"));
});

const updatePassword = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request");
	}
	const { newPassword } = req.body;

	const user = await User.findById(req.user._id);
	user.password = password;
	await user.save({ validateBeforeSave: false });
	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Password updated successfully"));
});

const sendRequest = asyncHandler(async (req, res) => {});

const acceptRequest = asyncHandler(async (req, res) => {});

const sendMessage = asyncHandler(async (req, res) => {});

const deleteMessage = asyncHandler(async (req, res) => {});

export {
	register,
	login,
	logout,
	updateProfile,
	updatePassword,
	sendMessage,
	sendRequest,
	acceptRequest,
	deleteMessage,
	deleteAccount,
};
