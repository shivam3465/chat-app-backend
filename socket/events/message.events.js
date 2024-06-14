const MESSAGE_EVENTS = {
	// message sent from frontend by user
	MESSAGE_SENT: "MESSAGE_SENT",

	//(single-tick), message acknowledged by backend and stored in receivers conversation
	MESSAGE_RECEIVED_BY_SERVER: "MESSAGE_RECEIVED_BY_SERVER",

	// (double-tick ), response of message sent to receiver by backend successfully
	MESSAGE_DELIVERED: "MESSAGE_DELIVERED",

	//will be sent from backend to frontend to the owner of message that message was read by receiver
	MESSAGE_READ_BY_USER: "MESSAGE_READ_BY_USER",
	
	//message is read by the receiver , sent from frontend to backend
	READ_MESSAGE: "READ_MESSAGE",

	//this will be sent by our backend to the receiver with sender message
	NEW_MESSAGE_RECEIVED: "NEW_MESSAGE_RECEIVED",

	//sent from frontend for deletion of message
	DELETE_MESSAGE: "DELETE_MESSAGE",

	// response to the  DELETE_MESSAGE
	MESSAGE_DELETED: "MESSAGE_DELETED",
};

export { MESSAGE_EVENTS };
