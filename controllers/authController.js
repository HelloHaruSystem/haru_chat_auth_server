/**
 * Authentication controller for Haru_Chat.
 * Handles HTTP requests for authentication
 * 
 * @module controllers/authController
 */

import { AuthenticationError, ValidationError } from "../middleware/errorMiddleware.js";
import { AuthService } from "../services/authService.js";

/**
 * Express objects and functions
 * @typedef {Object} Request Express request object
 * @typedef {Object} Response Express response object
 * @typedef {Function} NextFunction Express next middleware function
 */

/**
 * Controller for authentication. operations include user registration, login and getCurrentUser
 */
class AuthController {
    /**
     * Creates an instance of AuthController.
     * @param {AuthService} authService - Service handling authentication logic
     */
    constructor(authService) {
        this._authService = authService;
    }

    /**
     *  Register a new user.
     * 
     * @async
     * @param {Request} req - Express request object. 
     * @param {Response} res - Express response object. 
     * @param {Function} next - Express next middleware function. 
     */
    register = async (req, res, next) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                throw new ValidationError("Username and password are required");
            }

            const result = await this._authService.register(username, password);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * logs in a user
     * 
     * @async
     * @param {Request} req - Express request object. 
     * @param {Response} res - Express response object. 
     * @param {Function} next - Express next middleware function. 
     */
    login = async (req, res, next) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                throw new ValidationError("Username and password are required");
            }

            const result = await this._authService.login(username, password);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validates a user.
     * 
     * @async
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    validate = async (req, res, next) => {
        try {
            const { username } = req.body;

            // get the token from the Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new AuthenticationError("No token provided or invalid format");
            }

            // extract the token
            const token = authHeader.split(' ')[1];
            
            // auth service to validate token
            const result = await this._authService.validateTokenWithUsername(token, username);

            res.status(200).json({
                valid: true,
                message: result.message,
                user: result.user
            });
        } catch (error) {
            next(error);
        }
    }

   /**
    * Gets the current user information
    *  
    * @async
    * @param {Request} req - Express request object. 
    * @param {Response} res - Express response object. 
    * @param {Function} next - Express next middleware function. 
    */
    getCurrentUser = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const result = await this._authService.validateToken(userId);
            res.json(result);
        } catch (error) {
            next(error);
        }
   };
}

export { AuthController };