import { User } from "../../models/user.js";
import { USER_EVENTS } from "../events/user.events.js";
import { getSocketId } from "../socket.js";
import { io } from "../../app.js";
import { createNewConversation } from "../../utils/conversation/createNewConversation.js";
import { Conversation } from "../../models/conversation.js";

// handles event from frontend
const handleFriendRequestSending = async (userObj, data) => {
	const { receiverUserId } = data;
	const { user, userId } = userObj;

	// console.log(" received data", userId, receiverUserId, data);

	if (!userId || !receiverUserId) {
		console.log("user id not provided ", userId, receiverUserId);
		return;
	}

	//storing in the database of receiver
	const foundUser = await User.findById(receiverUserId).lean();

	if (foundUser) {
		console.log(" found user true ", foundUser.userName);

		// Check if they are already friends
		const isAlreadyFriend = foundUser.friends?.includes(userId);

		if (!isAlreadyFriend) {
			await User.findByIdAndUpdate(receiverUserId, {
				$push: { invitesReceived: userId },
			});

			await User.findByIdAndUpdate(userId, {
				$push: { invitesSent: receiverUserId },
			});

			const receiverSocketId = getSocketId(receiverUserId);

			//if he is online
			if (receiverSocketId) {
				console.log("Emitting event to: ", receiverSocketId);

				const { userName, _id: id } = user;

				io.to(receiverSocketId).emit(
					USER_EVENTS.RECEIVED_FRIEND_REQUEST,
					{
						sender: { userName, id }, //sending only id and user name and also image will be also sent
					}
				);
			}
		}
	} else console.log("User not found ", foundUser);

	const senderSocketId = getSocketId(userId);
	io.to(senderSocketId).emit(
		USER_EVENTS.FRIEND_REQUEST_DELIVERED,
		"request sent successfully"
	);
};

const removeUserIdFromList = async (id, targetObj) => {
	await User.findByIdAndUpdate(id, {
		$pull: targetObj,
	});
};

const handleAcceptFriendRequest = async (userObj, data) => {
	const { receiverUserId } = data;
	const { user, userId } = userObj;

	try {
		// Find the receiver user
		const receiverUser = await User.findById(receiverUserId);
		if (!receiverUser) {
			console.error("Receiver user not found");
			return;
		}

		// Check if they are already friends
		const isAlreadyFriends =
			receiverUser.friends?.includes(userId) &&
			user.friends?.includes(receiverUserId);

		if (!isAlreadyFriends) {
			// Add each other to their friends' list
			await User.findByIdAndUpdate(userId, {
				$push: { friends: receiverUserId },
			});

			await User.findByIdAndUpdate(receiverUserId, {
				$push: { friends: userId },
			});

			// Remove the sender's ID from the receiver's invitesReceived array

			await removeUserIdFromList(userId, {
				invitesReceived: receiverUserId,
			});

			// Remove the receiver's ID from the sender's invitesSent array
			await removeUserIdFromList(receiverUserId, {
				invitesSent: userId,
			});

			const conversation = await Conversation.findOne({
				users: { $all: [userId, receiverUserId] },
				$expr: { $eq: [{ $size: "$users" }, 2] },
			});

			if (conversation) {
				console.log("conversation found ", conversation);
				// Update isConversationActive to true
				await Conversation.updateOne(
					{ _id: conversation._id },
					{ $set: { isConversationActive: true } }
				);
			} else {
				console.log("conversation found ", conversation);
				// Create a new conversation
				await createNewConversation(
					[userId, receiverUserId],
					"-",
					true // as this is personal chat
				);
			}

			// console.log("Users are now friends",user._id,receiverUser._id,user.userName,receiverUser.userName);

			// Emit events to notify both users about the new friendship
			const receiverSocketId = getSocketId(receiverUserId);

			if (receiverSocketId) {
				io.to(receiverSocketId).emit(
					USER_EVENTS.FRIEND_REQUEST_ACCEPTED,
					{
						id: user._id,
						userName: user.userName,
					}
				);
			}

			const senderSocketId = getSocketId(userId);

			if (senderSocketId) {
				io.to(senderSocketId).emit(
					USER_EVENTS.FRIEND_REQUEST_ACCEPTED,
					{
						id: receiverUser._id,
						userName: receiverUser.userName,
					}
				);
			}
		} else {
			console.log("Users are already friends");
		}
	} catch (error) {
		console.error("Error accepting friend request: ", error);
	}
};

const handleRejectFriendRequest = async (userObj, data) => {
	console.log("Friend Request data :  ", data);

	const { receiverUserId } = data;
	const { user, userId } = userObj;

	try {
		// Find the receiver user
		const receiverUser = await User.findById(receiverUserId);
		if (!receiverUser) {
			console.error("Receiver user not found");
			return;
		}

		await removeUserIdFromList(userId, {
			invitesReceived: receiverUserId,
		});

		// Remove the receiver's ID from the sender's invitesSent array
		// await removeUserIdFromList(receiverUserId, {
		// 	invitesSent: userId,
		// });

		console.log(
			" friends request rejected",
			user._id,
			receiverUser._id,
			user.userName,
			receiverUser.userName
		);
	} catch (err) {
		console.log("error in accepting friend request", err);
	}
};

export {
	handleFriendRequestSending,
	handleAcceptFriendRequest,
	handleRejectFriendRequest,
};
