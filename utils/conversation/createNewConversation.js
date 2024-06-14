import { Conversation } from "../../models/conversation.js";
import { User } from "../../models/user.js";

export const createNewConversation = async (userIds,conversationName,isPersonalChat)=>{
    // Create the conversation
	const newConversation = new Conversation({ users: userIds,conversationName: conversationName , isPersonalChat});
	await newConversation.save();

	// Update users to include the new conversation
	await User.updateMany(
		{ _id: { $in: userIds } },
		{ $push: { conversations: newConversation._id } }
	);
}