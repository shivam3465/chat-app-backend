import { Message } from "../models/message.js";
import { asyncErrorLogger } from "../utils/errorHandler/asyncErrorLogger.js";

const createNewMessage = async ({ messageContent, owner, conversationId , status}) => {
	const newMessage = await Message.create({
		messageContent,
		owner,
		conversationId,
        status 
	});

	return newMessage;
};

export { createNewMessage };
