import { MESSAGE_EVENTS } from "./events/message.events.js";
import { USER_EVENTS } from "./events/user.events.js";
import {
	handleMessageDeleteRequest,
	handleMessageHasBeenReadByReceiver,
	handleMessageSentByUser,
} from "./handlers/message.handlers.js";
import {
	handleAcceptFriendRequest,
	handleFriendRequestSending,
	handleRejectFriendRequest,
} from "./handlers/user.handlers.js";

// Create a new Map to store user IDs and socket IDs
const onlineUsers = new Map();

// Function to add a user
const addUser = (userId, socketId) => {
	onlineUsers.set(userId, socketId);
	console.log(`User ${userId} connected with socket ID ${socketId}`);
};

// Function to remove a user
const removeUser = (userId) => {
	onlineUsers.delete(userId);
	console.log(`User ${userId} disconnected`);
};

// Function to get a socket ID by user ID
const getSocketId = (userId) => {
	return onlineUsers.get(userId);
};

const disconnectUser = (userId) => {
	console.log("A user disconnected", userId);
	removeUser(userId);
};

const handleSocket = (socket) => {
	const { user, userId } = socket;

	//add user after the connection has been established
	addUser(userId, socket.id);

	//<---------------    message events and there handlers    ----------->
	socket.on(MESSAGE_EVENTS.MESSAGE_SENT, (data) =>
		handleMessageSentByUser({ user, userId }, data)
	);

	socket.on(MESSAGE_EVENTS.READ_MESSAGE, (data) =>
		handleMessageHasBeenReadByReceiver({ user, userId }, data)
	);

	socket.on(MESSAGE_EVENTS.DELETE_MESSAGE, (data) =>
		handleMessageDeleteRequest({ user, userId }, data)
	);

	// <----------------   user events and there handlers ------------>
	socket.on(USER_EVENTS.FRIEND_REQUEST_SENDING, (data) =>
		handleFriendRequestSending({ user, userId }, data)
	);

	socket.on(USER_EVENTS.ACCEPT_FRIEND_REQUEST, (data) =>
		handleAcceptFriendRequest({ user, userId }, data)
	);

	socket.on(USER_EVENTS.REJECT_FRIEND_REQUEST, (data) =>
		handleRejectFriendRequest({ user, userId }, data)
	);

	//<-----------------   disconnect user by removing the userId from the online user    ----------------->
	socket.on("disconnect", () => disconnectUser(userId));
};

export { handleSocket, getSocketId };
