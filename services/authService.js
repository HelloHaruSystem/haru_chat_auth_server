import bcrypt from "bcrypt";

import { generateToken } from "./../utils/jwtUtils.js";
import { ValidationError, AuthenticationError, NotFoundError, ConflictError, ForbiddenError } from "../middleware/errorMiddleware.js";

class AuthService {
    constructor(userService) {
        this._userService = userService;
    }

    async register(username, password) {
        try {
            if (!username || !password) {
                throw new ValidationError("Username and password are required")
            }

            // create user with help from user service
            const user = await this._userService.createUser(username, password);

            return {
                success: true,
                message: "User registered successfully",
                user
            };
        } catch (error) {
            if (error.message.includes("User already exists")) {
                throw new ConflictError("User already exists");
            }
            throw error;
        }
    }

    async login(username, password) {
        try {
            if (!username || !password) {
                throw new ValidationError("Username and password are required");
            }

            // auth via user service 
            const authResult = await this._userService.authenticateUser(username, password);

            if (!authResult.success) {
                throw new AuthenticationError(authResult.message);
            }

            // generate jwt token
            const token = generateToken({
                userId: authResult.user.id,
                username: authResult.user.username,
                roles: authResult.user.roles
            });

            return {
                success: true,
                message: "Login successful",
                token,
                user: authResult.user
            };
        } catch (error) {
            if (error.message === "User not found") {
                throw new NotFoundError("User not found");
            } else if (error.message === "user has been banned") {
                throw new ForbiddenError("Permission denied")
            }
            throw error;
        }
    }

    async validateToken(userId) {
        try {
            const user = await this._userService.getUserById(userId);

            if (!user) {
                throw new NotFoundError("User not found");
            }

            if (user.isBanned) {
                throw new ForbiddenError("User is banned");
            }

            return {
                success: true,
                user
            };
        } catch (error) {
            throw error;
        }
    }
}

export { AuthService };