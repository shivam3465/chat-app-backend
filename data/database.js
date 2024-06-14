import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, { dbName: "chat-app" })
    .then((e) => console.log("database connected successfully"))
    .catch((e) => console.log(e));
};
