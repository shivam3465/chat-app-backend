import jwt from "jsonwebtoken";

import { User } from "../models/user.js";
import { CustomError } from "../utils/errorHandler/ErrorClass.js";
import { Conversation } from "../models/conversation.js";

const transformConversation = (conversations, user) => {
	// Transform conversations for personal chats and add receiver name if needed
	const transformedConversations = conversations?.map((conversation) => {
		const { isPersonalChat } = conversation;
		let newConversationName = "";

		if (isPersonalChat) {
			const otherUser = conversation.users.find(
				(userDoc) => userDoc.id.toString() !== user._id.toString()
			);
			newConversationName = otherUser ? otherUser.userName : "";
		}

		return {
			...conversation,
			isPersonalChat,
			conversationName: isPersonalChat
				? newConversationName
				: conversation.conversationName,
		};
	});
	return transformedConversations || [];
};

const searchUsersByUserName = async (query, currentUserData) => {
	const regex = new RegExp(query, "i");

	// Find users whose username matches the query
	const matchedUsers = await User.find({
		userName: { $regex: regex },
	})
		.limit(10)
		.lean();

	const friendsSet = new Set(
		currentUserData?.friends?.map((friend) => friend.toString())
	);

	const invitesSentSet = new Set(
		currentUserData?.invitesSent?.map((invite) => invite.toString())
	);

	// Format the matched users to have conversation details also if that user is a friend
	const result = await Promise.all(
		matchedUsers.map(async (curUser) => {
			let conversation = {};
			if (friendsSet.has(curUser._id.toString())) {
				const conversationFound = await Conversation.findOne({
					users: { $all: [curUser._id, currentUserData._id] },
					isPersonalChat: true,
				})
					.select("lastMessageSent conversationImage")
					.lean();

				conversation = conversationFound ? conversationFound : null;
			}

			return {
				userName: curUser.userName,
				imageURL: curUser.imageURL || "", // Assuming user has imageURL field
				id: curUser._id,
				isFriend: friendsSet.has(curUser._id.toString()),
				inviteSent: invitesSentSet.has(curUser._id.toString()),
				conversation: conversation
					? {
							...conversation,
							conversationName: curUser.userName,
					  }
					: null,
			};
		})
	);

	return result;
};

const processUsersDetails = async (user, next) => {
	// Populate invitesReceived and conversations with specific fields
	const populatedUser = await User.findById(user._id)
		.populate({
			path: "invitesReceived",
			select: "_id userName",
			transform: (doc) => ({ id: doc._id, userName: doc.userName }), // Transform _id to id
		})
		.populate({
			path: "conversations",
			select: "conversationName lastMessageSent conversationImage users isPersonalChat",
			populate: [
				{
					path: "users",
					select: "userName",
					transform: (doc) => ({
						id: doc._id,
						userName: doc.userName,
					}), // Transform _id to id
				},
				{
					path: "lastMessageSent",
					select: "messageContent createdAt owner",
					populate: {
						path: "owner",
						select: "userName",
						transform: (doc) => ({
							id: doc._id,
							userName: doc.userName,
						}), // Transform _id to id
					},
				},
			],
		})
		.lean();

	if (!populatedUser) {
		next(
			new CustomError({
				message: "User not found",
				statusCode: 401,
				unAuthorized: true,
			})
		);
	}

	// Exclude password and email from the response
	const { password: userPassword, _id, email, ...rest } = populatedUser;
	const id = jwt.sign(populatedUser._id.toString(), process.env.SECRET_KEY);

	const transformedConversations = transformConversation(
		populatedUser.conversations,
		user
	);

	return {
		processedUser: {
			user: {
				...rest,
				id: populatedUser._id,
				conversations: transformedConversations,
			},
		},
		id,
	};
};

const removeUserFromFriendList = async (
	friendId,
	userId,
	conversationId,
	next
) => {
	const result = await User.updateOne(
		{ _id: userId },
		{ $pull: { friends: friendId } }
	);

	const result2 = await User.updateOne(
		{ _id: friendId },
		{ $pull: { friends: userId } }
	);

	const result3 = await Conversation.updateOne(
		{ _id: conversationId },
		{ $set: { isConversationActive: false } }
	);

	console.log(result3);
	if (result.nModified === 0) {
		next("No documents were updated");
	}
};

export { searchUsersByUserName, processUsersDetails, removeUserFromFriendList };
