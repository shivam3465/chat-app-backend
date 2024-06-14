import { Message } from "../models/message.js";
import { asyncErrorHandler } from "../utils/errorHandler/asyncErrorHandler.js";

const getAllMessage = asyncErrorHandler(async (req, res, next) => {
	const { user } = req;
	
	const { conversationId } = req.params;
	const messages = await Message.find({ conversationId }).lean();	

	const structuredMessages = messages.map((message) => {
		return {
			...message,
			time: message.createdAt,
			self: message.owner.toString() === user._id.toString(),
		};
	});

	res.json({
		success: true,
		message: "Message found successfully ",
		messages: structuredMessages,
	});
});

export { getAllMessage };
