// Error handling middleware
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

// 404 middleware for undefined routes
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
};

// Custom error classes
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}

class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
    }
}

export {
    errorHandler,
    notFoundHandler,
    ValidationError,
    AuthenticationError,
    ForbiddenError,
    NotFoundError,
    ConflictError
};