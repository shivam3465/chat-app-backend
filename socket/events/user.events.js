const USER_EVENTS = {
	//will be sent by the sender to our server
	FRIEND_REQUEST_SENDING: "FRIEND_REQUEST_SENDING",

	//both of these will be sent by friend receiver to our server
	ACCEPT_FRIEND_REQUEST: "ACCEPT_FRIEND_REQUEST",
	REJECT_FRIEND_REQUEST: "REJECT_FRIEND_REQUEST",

	//will be sent by the server as a response to sender
	FRIEND_REQUEST_DELIVERED: "FRIEND_REQUEST_DELIVERED",

	//will be sent by the server as a notification to friend request receiver
	RECEIVED_FRIEND_REQUEST: "RECEIVED_FRIEND_REQUEST",

	//will be sent as a notification to both sender and receiver as notification (Like this -> ${user} is now your friend, send Hi)
	FRIEND_REQUEST_ACCEPTED: "FRIEND_REQUEST_ACCEPTED",
};
export { USER_EVENTS };
