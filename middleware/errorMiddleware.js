/**
 * Error handling middleware and custom error classes
 * Provides error classes for common http response codes
 * 
 * @module middleware/errorMiddleware
 */

/**
 * Error handling middleware for express
 * Catches errors throw in routes or other middleware,
 * formats the them and sends a JSON response
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.stack}`);
    
    // Define error types and their corresponding status codes
    const errorTypes = {
        ValidationError: 400,
        AuthenticationError: 401,
        ForbiddenError: 403,
        NotFoundError: 404,
        ConflictError: 409
    };
    
    // Get status code based on error name or default to 500
    const statusCode = errorTypes[err.name] || err.statusCode || 500;
    
    // Send response
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        // Include stack trace in development environment only
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Middleware for handling 404(Not Found) errors
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
};

// Custom error classes

/**
 * Custom error class for validation errors 400(Bad Request)
 * @extends Error
 */
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Custom error class for authentication failures 401(unauthorized)
 * @extends Error
 */
class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

/**
 * Custom error class for permission issues 403(Forbidden)
 * @extends Error
 */
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
    }
}

/**
 * Custom error class for resources not found or non existing 404(Not Found)
 * @extends Error
 */
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}

/**
 * Custom error class for conflicts with existing resources
 * E.g. a user already existing when attempting to register a new user
 * @extends Error
 */
class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
    }
}

// I'm a teapot (418)
/**
 * Custom error class for I'm a Teapot 418(I'm a teapot)
 * old aprils fools joke
 * just for fun
 * 
 * ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/418
 * 
 * @extends Error
 */
class ImATeapotError extends Error {
    constructor(message) {
        super(message);
        this.name = "I'm a teapot"
    }
}

export {
    errorHandler,
    notFoundHandler,
    ValidationError,
    AuthenticationError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ImATeapotError
};