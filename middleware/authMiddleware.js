import { verifyToken, extractToken } from "../utils/jwtUtils";
import { AuthenticationError, ForbiddenError } from "./errorMiddleware";
import { UserService  } from "../services/userService";
import { DbService } from "../services/dbService";

const dbService = new DbService();
const userService = new UserService(dbService);

// Authentication middleware
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

// Authorization middleware
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