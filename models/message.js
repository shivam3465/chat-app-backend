import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		messageContent: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["READ", "DELIVERED", "SENT"],
			required: true,
		},
		conversationId: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "conversation",
		},
		owner: { type: mongoose.SchemaTypes.ObjectId, ref: "users" },
	},
	{ timestamps: true }
);

// Index for faster querying of messages in a conversation
messageSchema.index({ conversationId: 1 });

export const Message = mongoose.model("messages", messageSchema);
