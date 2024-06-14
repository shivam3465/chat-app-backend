import { app, httpServer } from "./app.js";
import { config } from "dotenv";
import { connectDB } from "./data/database.js";
import cloudinary from "cloudinary";

config({ path: "./data/config.env" });
connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.get("/", (req, res) =>
  res.json({ success: true, message: "welcome to home page" })
);

httpServer.listen(process.env.PORT, () =>
  console.log("listening on port " + process.env.PORT)
);
