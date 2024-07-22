import { Message } from "../models/message.js";
import { asyncErrorLogger } from "../utils/errorHandler/asyncErrorLogger.js";

const createNewMessage = async ({
	messageContent,
	owner,
	conversationId,
	status,
	repliedMessage,
}) => {
	let newMessage = null;

	if (repliedMessage) {
		newMessage = await Message.create({
			messageContent,
			owner,
			conversationId,
			status,
			repliedMessageId: repliedMessage._id,
		});
	} else {
		newMessage = await Message.create({
			messageContent,
			owner,
			conversationId,
			status,
		});
	}

	return newMessage;
};

export { createNewMessage };
