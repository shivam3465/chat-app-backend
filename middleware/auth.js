import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { CustomError } from "../utils/errorHandler/ErrorClass.js";

const findUser = async (token) => {
	const id = jwt.verify(token, process.env.SECRET_KEY);
	
	if(!id) return null;
	

	const user = await User.findById(id).select(["-email", "-password"]).lean();
	
	return user;
};

const authenticated = async (req, res, next) => {
	const { token } = req.cookies;
	if (!token) {
		return next(
			new CustomError({
				message: "User not logged in",
				statusCode: 401,
				unAuthorized: true,
			})
		);
	}

	const user = await findUser(token);

	if (!user) {
		return next(
			new CustomError({
				message: "User not found",
				statusCode: 401,
				unAuthorized: true,
			})
		);
	}
	req.user = user;
	next();
};

const socketAuthenticator = async (err, socket, next) => {
	try {
		if (err) return next(err);
		const token = socket.request.cookies["token"];

		// console.log("user id ", token);
		const user = await findUser(token);

		if (!user) return next(new CustomError({ message: "User not exists" }));
		
		socket.user = user;
		socket.userId = user._id.toString();

		next();
	} catch (error) {
		console.log("error in socket ", error);
		next(error);
	}
};

export { authenticated, socketAuthenticator };
