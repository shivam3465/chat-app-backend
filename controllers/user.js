import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { hash, compare } from "bcrypt";
import { setCookie } from "../utils/setCookies.js";
import cloudinary from "cloudinary";
import { SendMail } from "../middleware/sendMail.js";
import { asyncErrorHandler } from "../utils/errorHandler/asyncErrorHandler.js";
import { CustomError } from "../utils/errorHandler/ErrorClass.js";
import {
	processUsersDetails,
	removeUserFromFriendList,
	searchUsersByUserName,
} from "../services/user.services.js";

const registerUser = asyncErrorHandler(async (req, res, next) => {
	const { userName, email, password } = req.body;

	if (!userName || !email || !password) {
		return next(
			new CustomError({
				message: "Please provide all the required fields",
				statusCode: 400,
				allFieldsProvided: false,
			})
		);
	}

	// Check if email is valid
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	if (!emailRegex.test(email)) {
		return next(
			new CustomError({
				message: "Please provide a valid email address",
				statusCode: 400,
				invalidEmail: false,
			})
		);
	}

	const user = await User.findOne({ email });
	if (user) {
		return next(
			new CustomError({
				message: "User already exists",
				statusCode: 400,
				alreadyRegisteredUser: true,
			})
		);
	}

	const encryptedPassword = await hash(password, 10);
	await User.create({ userName, email, password: encryptedPassword });
	return res.json({ success: true, message: "User created successfully" });
});

const login = asyncErrorHandler(async (req, res, next) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email }).select("+password").lean();
	if (!user)
		return next(
			new CustomError({
				message: "User do not exist",
				statusCode: 400,
				userNotFound: true,
			})
		);

	const isPasswordCorrect = await compare(password, user.password);
	if (!isPasswordCorrect)
		return next(
			new CustomError({
				message: "Wrong Email id or Password",
				statusCode: 400,
				wrongPasswordOrEmail: true,
			})
		);

	const { processedUser, id } = await processUsersDetails(user, next);

	setCookie(
		res,
		200,
		"token",
		id,
		86400000,
		"Login successful",
		processedUser
	);
});

const logout = (req, res) => {
	setCookie(res, 200, "token", "", 0, "Logged out successfully");
};

const getUserDetails = async (req, res, next) => {
	const { user } = req;

	const { processedUser, id } = await processUsersDetails(user, next);

	setCookie(
		res,
		200,
		"token",
		id,
		432000000,
		"Details fetched successfully",
		processedUser
	);
};

const searchUsers = asyncErrorHandler(async (req, res, next) => {
	const { query } = req.query; // match query with user name
	const results = await searchUsersByUserName(query, req.user);

	res.json({
		success: true,
		message: "Users found successfully",
		data: results,
	});
});

const removeFriend = asyncErrorHandler(async (req, res, next) => {
	const { friendId, conversationId } = req.body; // match query with user name
	await removeUserFromFriendList(
		friendId,
		req.user._id,
		conversationId,
		next
	);

	res.json({
		success: true,
		message: "Friend removed successfully",
	});
});

// const addDesc = async (req, res) => {
//   try {
//     const { desc } = req.body;
//     const user = await User.findById(req.user.id);
//     user.desc = desc;
//     user.save();

//     res.json({ success: true, message: "Description updated successfully" });
//   } catch (error) {
//     showError(res, 400, error.message);
//   }
// };

// const addAbout = async (req, res) => {
//   try {
//     const { aboutMe } = req.body;
//     const user = await User.findById(req.user.id);
//     user.aboutMe = aboutMe;
//     user.save();

//     res.json({
//       success: true,
//       message: "About Description updated successfully",
//     });
//   } catch (error) {
//     showError(res, 400, error.message);
//   }
// };

// const addProfile = async (req, res) => {
//   try {
//     const { profile } = req.body;
//     const user = await User.findById(req.user.id);

//     cloudinary.v2.uploader.destroy(user.aboutPic.public_id);
//     const image = await cloudinary.v2.uploader.upload(profile, {
//       folder: "portfolio",
//     });
//     user.aboutPic = image;

//     user.save();

//     res.json({ success: true, message: "Profile image added successfully" });
//   } catch (error) {
//     showError(res, 400, error.message);
//   }
// };

export {
	login,
	logout,
	getUserDetails,
	registerUser,
	searchUsers,
	removeFriend,
};
