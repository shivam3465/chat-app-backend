import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    default: "User",
    required: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    , "Please fill a valid email address"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
    minlength: [6, "Password must be at least 6 characters long"]
  },
  conversations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations"
    }
  ],
  invitesSent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  invitesReceived: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ],
}, { timestamps: true });

// Custom validation: Ensure unique email
userSchema.path('email').validate(async (email) => {
  const emailCount = await mongoose.models.user?.countDocuments({ email });
  return !emailCount;
}, 'Email already exists');

export const User = mongoose.model("users", userSchema);
