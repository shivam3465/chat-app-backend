import { Conversation } from "../../models/conversation.js";
import { User } from "../../models/user.js";
import { CustomError } from "../errorHandler/ErrorClass.js";

export const checkAndAddUserInConversation = async (
	userId,
	conversationId,
	next
) => {
	// Check if all users exist
	const user = await User.findById(userId);
	if (!user) {
		return next(
			new CustomError({
				message: "Users do not exist.",
				statusCode: 400,
				userNotFound: true,
			})
		);
	}

	// Check if all users exist
	const conversationFound = await Conversation.findById(conversationId);
	if (!conversationFound) {
		return next(
			new CustomError({
				message: "Conversation do not exist.",
				statusCode: 400,
				conversationNotFound: true,
			})
		);
	}

	//checking if the current user is already added in conversation group or not
	let isAlreadyAdded =
		user.conversations.find(
			(curConvoId) => curConvoId === conversationId
		) || conversationFound.users.find((curUserId) => curUserId === userId);

	if (isAlreadyAdded) {
		return next(
			new CustomError({
				message: "Already added in this conversation",
				statusCode: 400,
				isAlreadyAdded,
			})
		);
	}

    conversationFound.users.push(userId);
    user.conversations.push(conversationId);

    await conversationFound.save();
    await user.save();
};
