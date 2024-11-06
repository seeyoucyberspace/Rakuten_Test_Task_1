import logger from './logger.js';

class ErrorHandler extends Error {
    // Constructor to create errors with status and message
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }

    // Static methods to create common errors
    static badRequest(message) {
        return new ErrorHandler(400, message);
    }

    static unauthorized(message) {
        return new ErrorHandler(401, message);
    }

    static internal(message) {
        return new ErrorHandler(500, message);
    }
}

// Handles error and returns response with appropriate status and message
const handleError = (err, res) => {
    const { statusCode, message } = err;
    logger.error(`Error: ${message} (status: ${statusCode})`);
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message
    });
};

export { ErrorHandler, handleError };