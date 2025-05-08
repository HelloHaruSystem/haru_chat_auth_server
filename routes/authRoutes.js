/**
 * Authentication routes for Haru_Chat.
 * Defines endpoints for user registration, login, and profile information
 * 
 * @module routes/authRoutes
 */

import express from "express";

import { AuthService } from "../services/authService.js";
import { AuthController } from "../controllers/authController.js";
import { UserService } from "../services/userService.js";
import { DbService } from "../services/dbService.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

/**
 * Express router for authentication routes
 * @type {express.Router}
 */
const router = express.Router();

// initialize services and controller
const dbService = new DbService();
const userService = new UserService(dbService);
const authService = new AuthService(userService);
const authController = new AuthController(authService);

/**
 * POST /api/auth/register
 * Registers a new user.
 * 
 * @name RegisterUser
 * @route {POST} /api/auth/register
 * @bodyparam {string} username - User's username
 * @bodyparam {string} password - User's password
 * @returns {Object} Result with user data
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT.
 * 
 * @name LoginUser
 * @route {POST} /api/auth/login
 * @bodyparam {string} username - User's username
 * @bodyparam {string} password - User's password
 * @returns {Object} Result with token and user data
 */
router.post("/login", authController.login);

/**
 * Post /api/auth/validate
 * Token validation endpoint
 * Validates JWT token for the Authorization header and checks username
 * 
 * @name ValidateUser
 * @route
 * @authentication JWT required
 * @bodyparam {string} username - User's username
 * @returns {Object} Result with token and and user data
 */
router.post("/validate", authController.validate);

// protected routes

/**
 * GET /api/auth/me
 * Gets the current authenticated user's profile.
 * Requires valid JWT.
 * 
 * @name GetCurrentUser
 * @route {GET} /api/auth/me
 * @authentication JWT required
 * @returns {Object} Current user data
 */
router.get("/me", authenticate, authController.getCurrentUser);

export { router };