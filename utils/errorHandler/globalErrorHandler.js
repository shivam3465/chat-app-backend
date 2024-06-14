export const globalErrorHandler = (error, req, res, next) => {
	console.error(error);
    
	const { statusCode, message, ...rest } = error;
	res.status(statusCode || 400).json({ success: false, message, ...rest });
};
