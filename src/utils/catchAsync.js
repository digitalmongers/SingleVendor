/**
 * catchAsync Utility
 * Wraps async functions to catch errors and pass them to the Express error handler.
 * Note: While Express 5 handles this automatically, this utility provides backward compatibility 
 * and explicit error handling control.
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

export default catchAsync;
