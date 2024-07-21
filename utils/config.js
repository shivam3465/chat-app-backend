const corsOption = {
	origin: [process.env.FRONTEND_URL,"http://localhost:3000"],
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true,
};


export {corsOption}