import { Message } from "../models/message.js";
import { asyncErrorHandler } from "../utils/errorHandler/asyncErrorHandler.js";

const getAllMessage = asyncErrorHandler(async (req, res, next) => {
	const { user } = req;
	const { conversationId } = req.params;

	const messages = await Message.find({ conversationId })
		.populate({
			path: 'repliedMessageId',
			select: 'messageContent owner createdAt',
		})
		.lean();

	const structuredMessages = messages.map((message) => {
		return {
			...message,
			time: message.createdAt,
			self: message.owner.toString() === user._id.toString(),
			repliedMessage: message.repliedMessageId
				? {
						messageContent: message.repliedMessageId.messageContent,
						self: message.repliedMessageId.owner.toString() === user._id.toString(),
						_id: message.repliedMessageId._id
				  }
				: null,
		};
	});

	res.json({
		success: true,
		message: "Messages found successfully",
		messages: structuredMessages,
	});
});

export { getAllMessage };
