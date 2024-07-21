const corsOption = {
	origin: [process.env.FRONTEND_URL],
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true,
};


export {corsOption}