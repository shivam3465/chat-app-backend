import { io } from "../../app.js";
import { Conversation } from "../../models/conversation.js";
import { Message } from "../../models/message.js";
import { User } from "../../models/user.js";
import { createNewMessage } from "../../services/message.services.js";
import { asyncErrorLogger } from "../../utils/errorHandler/asyncErrorLogger.js";
import { MESSAGE_EVENTS } from "../events/message.events.js";
import { getSocketId } from "../socket.js";

// handles event from frontend
const handleMessageSentByUser = asyncErrorLogger(async (userObj, data) => {
	// console.log("Message sent by user :  ", data);
	const { user, userId } = userObj;

	const { messageContent, conversationId, members, _id } = data;

	const senderSocketId = getSocketId(userId);

	if (!messageContent || !conversationId || !members || !_id) {
		console.log("all fields not provided ", data);
		return;
	}
	const conversation = await Conversation.findById(conversationId);

	//user is now not authorized to send message(if they both were earlier friend but not now or user was part of group but now he has left);
	if (!conversation.isConversationActive) {
		return io.to(senderSocketId).emit(MESSAGE_EVENTS.MESSAGE_FAILED, {
			messageId: _id,
			conversationId,
		});
	}

	const receiversUserId = conversation.users.filter(
		(curUserId) => curUserId.toString() !== userId
	);

	//emit message to those who are online
	const onlineReceiversSocketId = [];

	receiversUserId.forEach((curUserId) => {
		const curUserSocketId = getSocketId(curUserId.toString());
		curUserSocketId && onlineReceiversSocketId.push(curUserSocketId);
	});

	let SENDER_MESSAGE_EVENT = "",
		status = "";
	//meaning all receivers are online so all will get message delivered
	if (receiversUserId.length === onlineReceiversSocketId.length) {
		SENDER_MESSAGE_EVENT = MESSAGE_EVENTS.MESSAGE_DELIVERED;
		status = "DELIVERED";
	} else {
		//if not all receivers are online so message state will be single tick only
		SENDER_MESSAGE_EVENT = MESSAGE_EVENTS.MESSAGE_RECEIVED_BY_SERVER;
		status = "SENT";
	}

	const newMessage = await createNewMessage({
		messageContent,
		owner: userId,
		conversationId,
		status,
	});

	//save the message in the last sent message in this conversation
	await Conversation.findByIdAndUpdate(conversationId, {
		lastMessageSent: newMessage._id,
	});

	//sending the new message to all receivers
	io.to(...onlineReceiversSocketId).emit(
		MESSAGE_EVENTS.NEW_MESSAGE_RECEIVED,
		{
			message: newMessage,
			sender: {
				id: userId,
				userName: user.userName,
			},
		}
	);

	//sending message status to sender
	io.to(senderSocketId).emit(SENDER_MESSAGE_EVENT, {
		prevMessageId: _id,
		newMessageId: newMessage._id,
		conversationId,
		status,
	});

	//after that save the message in conversation collection by finding
	// conversation.lastMessageSent =
});

//will be sent by backend to frontend (blue double tick)
const handleMessageHasBeenReadByReceiver = asyncErrorLogger(
	async (userObj, data) => {
		const { user } = userObj;
		const { messageId, conversationId, messageOwnerId } = data;

		// console.log("----------- message has been read and received by backend --------",data);

		const isFound = user.conversations.some(
			(convoId) => convoId.toString() === conversationId.toString()
		);

		if (!isFound) {
			console.log("conversations not found");
			return;
		}
		await Message.findByIdAndUpdate(messageId, {
			status: "READ",
		});

		const messageOwnerFound = await User.findById(messageOwnerId);

		if (!messageOwnerFound) {
			console.log("message Owner not found");
			return;
		}

		const receiversSocketId = getSocketId(messageOwnerId);
		if (receiversSocketId)
			io.to(receiversSocketId).emit(MESSAGE_EVENTS.MESSAGE_READ_BY_USER, {
				conversationId,
				messageId,
			});
	}
);

//will be sent from frontend to backend (in deleting state)
const handleMessageDeleteRequest = asyncErrorLogger(async (data) => {});

//will be sent from backend to frontend (has been deleted)
const handleMessageDeletedSuccessFully = asyncErrorLogger(async (data) => {});

export {
	handleMessageSentByUser,
	handleMessageHasBeenReadByReceiver,
	handleMessageDeleteRequest,
	handleMessageDeletedSuccessFully,
};
