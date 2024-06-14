import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		// if users.length==2 meaning this conversation is personal else if users.length > 2 then it is a group chat
		users: [
			{
				type: mongoose.SchemaTypes.ObjectId,
				ref: "users",
			},
		],
		conversationImage: String, // in personal chat it will be other users image and in group chat it will be group chat image
		conversationName: { type: String, required: true }, //if it is a personal chat then username else group name
		lastMessageSent: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "messages",
		},
		isPersonalChat: {
			type: Boolean,
			required: true
		}
	},
	{ timestamps: true }
);

// Ensure there are at least two users in a conversation
conversationSchema.pre("save", function (next) {
	if (this.users.length < 2) {
		next(new Error("A conversation must have at least two users."));
	} else {
		next();
	}
});

// Index for faster querying of conversations involving specific users
conversationSchema.index({ users: 1 });

export const Conversation = mongoose.model("conversations", conversationSchema);
