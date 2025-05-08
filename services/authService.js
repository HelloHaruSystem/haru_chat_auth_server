/**
 * Authentication service for Haru_chat.
 * handles user registration, login, and token validation
 * 
 * @module services/authService
 */

import bcrypt from "bcrypt";

import { generateToken, verifyToken } from "./../utils/jwtUtils.js";
import { ValidationError, AuthenticationError, NotFoundError, ConflictError, ForbiddenError } from "../middleware/errorMiddleware.js";

/**
 * Service class for handling authentication related stuff
 */
class AuthService {
    /**
     * Constructor 
     * Creates an instance of AuthService
     * 
     * @param {Object} userService - Instance of UserService for user related stuff
     */
    constructor(userService) {
        this._userService = userService;
    }

    /**
     * Register a new user
     * 
     * @async
     * @param {string} username - User's username
     * @param {string} password - User's password (will be hashed)
     * @returns {Promise<Object>} Result object with user data
     * @throws {ValidationError} If username or password is not present
     * @throws {ConflictError} If user already exists
     */
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

    /**
     * Login method
     * Authenticates a user and generates a JWT.
     * 
     * @async
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise<Object>} - Result object with token and user data
     * @throws {NotFoundError} If user is not found
     * @throws {ForbiddenError} if user is banned or doesn't have access
     */
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

    /**
     * Validates a user token by checking if user exists and is not banned.
     * 
     * @async
     * @param {number} userId - ID of the user to validate
     * @returns {Promise<Object>} Result object with user data
     * @throws {NotFoundError} If user is not found
     * @throws {ForbiddenError} If user is banned
     */
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

    /**
     * Validates a JWT token and verifies the associated username
     * 
     * @async
     * @param {string} token - The JWT token to validate
     * @param {string} username - Username to verify against the token
     * @returns {Promise<Object>} Result object with validation status and user data
     * @throws {AuthenticationError} If token is invalid or username mismatch
     * @throws {NotFoundError} If user is not found
     * @throws {ForbiddenError} If user is banned
     */
    async validateTokenWithUsername(token, username) {
        try {
            if (!token || !username) {
                throw new ValidationError("Token and username are required");
            }
            
            // Verify the token
            let decoded;
            try {
                decoded = verifyToken(token);
            } catch (error) {
                if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                    throw new AuthenticationError('Invalid or expired token');
                }
                throw error;
            }
            
            // Check if the username in the token matches the provided username
            if (decoded.username !== username) {
                throw new AuthenticationError('Username mismatch');
            }
            
            // Validate that the user exists and is not banned
            const userResult = await this.validateToken(decoded.userId);
            
            return {
                success: true,
                message: 'Token is valid',
                user: userResult.user
            };
        } catch (error) {
            throw error;
        }
    }
}

export { AuthService };