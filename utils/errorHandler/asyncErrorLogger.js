export const asyncErrorLogger = (fun) => {
	return (...arg) => {
		fun(...arg).catch((err) => console.log("error occurred ", err));
	};
};
