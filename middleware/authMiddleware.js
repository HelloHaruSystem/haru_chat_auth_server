import { AuthenticationError, ForbiddenError } from '../middleware/errorMiddleware.js';

class AuthMiddleware {
    constructor(userService, jwtUtils) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }

    // Authenticate JWT token middleware
    authenticate() {
        return async (req, res, next) => {
            try {
                // Get token from authorization header
                const authHeader = req.headers.authorization;
                
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    throw new AuthenticationError('No token provided');
                }

                const token = this.jwtUtils.extractTokenFromHeader(authHeader);
                
                // Verify token
                const decoded = this.jwtUtils.verifyToken(token);
                
                // Check if user exists
                const user = await this.userService.getUserById(decoded.id);
                if (!user) {
                    throw new AuthenticationError('User not found');
                }

                // Check if user is banned
                if (user.isBanned) {
                    throw new ForbiddenError('User is banned');
                }

                // Add user to request
                req.user = user;
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    // Administrator check middleware
    isAdmin() {
        return (req, res, next) => {
            if (!req.user || !req.user.roles || !req.user.roles.includes('admin')) {
                throw new ForbiddenError('Requires admin privileges');
            }
            next();
        };
    }
    
    // Role check middleware
    hasRole(roleName) {
        return (req, res, next) => {
            if (!req.user || !req.user.roles || !req.user.roles.includes(roleName)) {
                throw new ForbiddenError(`Requires ${roleName} role`);
            }
            next();
        };
    }
}

export { AuthMiddleware };