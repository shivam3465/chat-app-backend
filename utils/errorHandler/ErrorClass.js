export class CustomError extends Error {
	constructor(errorObject = { message: "Unknown error", statusCode: 400 }) {
		super(errorObject.message);

		// message, statusCode , etc properties will be provided to it
		Object.keys(errorObject).map((key) => (this[key] = errorObject[key]));
		Error.captureStackTrace(this, this.constructor);
	}
}
