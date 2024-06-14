import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

// routers 
import userRouter from "./routers/user.js";
import messageRouter from "./routers/message.js";
import conversationRouter from "./routers/conversation.js";

// middlewares and configs
import { globalErrorHandler } from "./utils/errorHandler/globalErrorHandler.js";
import { handleSocket } from "./socket/socket.js";
import { corsOption } from "./utils/config.js";
import { authenticated, socketAuthenticator } from "./middleware/auth.js";

const app = express();
app.use(cors(corsOption));

const httpServer = createServer(app);

//socket instance
export const io = new Server(httpServer, {
	cors: corsOption,
});

// Socket.io middleware
io.use((socket,next)=>
	cookieParser()(
		socket.request,
		socket.request.res,
		async (err) => await socketAuthenticator(err,socket,next)
	));

io.on("connection", (socket) => handleSocket(socket));

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/conversation",conversationRouter);

// Catch-all for undefined routes
app.use((req, res, next) => {
	res.status(404).json({
		success: false,
		message: "No routes found",
	});
});

app.use("/", globalErrorHandler);

export { app, httpServer };
