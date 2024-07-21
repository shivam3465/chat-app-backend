import { Conversation } from "../models/conversation.js";
import { User } from "../models/user.js";
import { checkAndAddUserInConversation } from "../utils/conversation/checkAndAddUserInConversation.js";
import { createNewConversation } from "../utils/conversation/createNewConversation.js";
import { CustomError } from "../utils/errorHandler/ErrorClass.js";
import { asyncErrorHandler } from "../utils/errorHandler/asyncErrorHandler.js";

const getAllConversations = asyncErrorHandler(async (req, res, next) => {
	const { user } = req;
	const populatedUser = await User.findOne({ _id: user._id })
		.populate({
			path: "conversations",
			populate: {
				path: "users",
				select: "userName -_id",
			},
		})
		.select("conversations");

	const updatedConversation = populatedUser.conversations.map(
		(conversation) => {
			let newConversationName = null;
			if (conversation.isPersonalChat) {
				const Users = conversation.users;
				newConversationName =
					user.userName === Users[0].userName
						? Users[1].userName
						: Users[0].userName;
			}
			conversation.conversationName = newConversationName;
			console.log("conversation after update ", conversation);
			return conversation;
		}
	);

	res.json({
		success: true,
		message: "Conversations found",
		conversations: updatedConversation,
	});
});

const addConversation = asyncErrorHandler(async (req, res, next) => {
	const { userIds, conversationName } = req.body;

	// Check if all users exist
	const users = await User.find({ _id: { $in: userIds } });
	if (users.length !== userIds.length) {
		return next(
			new CustomError({
				message: "One or more users do not exist.",
				statusCode: 400,
				userNotFound: true,
			})
		);
	}

	const isPersonalChat = users.length == 2;

	await createNewConversation(userIds, conversationName, isPersonalChat);

	res.json({
		success: true,
		message: "Conversation created successfully",
	});
});

const addNewMemberInConversation = asyncErrorHandler(async (req, res, next) => {
	const { userId, conversationId } = req.body;

	await checkAndAddUserInConversation(userId, conversationId, next);

	res.json({
		success: true,
		message: "User added in the conversation created successfully",
	});
});

export { getAllConversations, addConversation, addNewMemberInConversation };
