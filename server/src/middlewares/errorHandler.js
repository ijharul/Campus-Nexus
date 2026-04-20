/**
 * 404 Not Found Middleware
 * Catch requests for routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

  /**
   * Custom Error Handler Middleware
   * Formats error messages, keeping stack traces only in dev mode
   */
  const errorHandler = (err, req, res, next) => {
    // If the status code is 200, but we reached the error handler, set it to 500
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
  
    // Check for Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      message = `Resource not found`;
      statusCode = 404;
    }
  
    res.status(statusCode).json({
      message,
      stack: process.env.NODE_ENV === 'production' ? 'null' : err.stack,
    });
  };
  
  export { notFound, errorHandler };
  
