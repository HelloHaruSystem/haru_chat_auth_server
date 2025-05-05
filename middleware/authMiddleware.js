/**
 * Authentication and authorization middleware for Haru_chat
 * provides functions to authenticate requests using JWT
 * and authorize access based on user roles
 * 
 * @module middleware/authMiddleware.js
 */

import { verifyToken, extractToken } from "../utils/jwtUtils.js";
import { AuthenticationError, ForbiddenError } from "./errorMiddleware.js";
import { UserService  } from "../services/userService.js";
import { DbService } from "../services/dbService.js";

const dbService = new DbService();
const userService = new UserService(dbService);

/**
 * Middleware to authenticate requests using JWT.
 * Extracts and verifies the JWT from the authorization header
 * then adds the decoded user information to the request.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {AuthenticationError} If authentication fails
 * @throws {ForbiddenError} If user is banned 
 */
const authenticate = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            throw new AuthenticationError("Authentication required");
        }

        const decoded = verifyToken(token);
        
        // check if user exists or is not banned
        const user = await userService.getUserById(decoded.userId);

        if (!user) {
            throw new AuthenticationError("User not found");
        }

        if (user.isBanned) {
            throw new ForbiddenError("User is banned");
        }

        // add the user information to the request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            next(new AuthenticationError("Invalid or expired token"));
        } else {
            next(error);
        }
    }
};

/**
 * Middleware to authorize requests based on user roles.
 * Checks if the user has at least one of the required roles.
 * 
 * @param {string|string[]} roles - Role or roles of the user 
 * @returns {Function} express middleware function
 * @throws {ForbiddenError} if user lacks required role/roles
 */
const authorize = (roles = []) => {
    if (typeof roles === "string") {
        roles= [roles];
    }

    return (req, res, next) => {
        if (!req.user || !req.user.roles || (roles.length && !req.user.roles.some(role => roles.includes(role)))) {
            throw new ForbiddenError("Insufficient permissions");
        }
        next();
    };
};

export { authenticate, authorize };