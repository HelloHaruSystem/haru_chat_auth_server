/**
 * User management routes for Haru_Chat.
 * Defines endpoints for user CRUD operation and bans
 * 
 * @module routes/userRoutes
 */

import express from "express";

import { UserController } from "../controllers/userController.js";
import { UserService } from "../services/userService.js";
import { DbService } from "../services/dbService.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

/**
 * Express router for user management routes.
 * @type {express.Router}
 */
const router = express.Router();

// init services and controllers
const dbService = new DbService();
const userService = new UserService(dbService);
const userController = new UserController(userService);

/**
 * GET /api/users/:id
 * Gets a user by ID.
 * Requires authentication.
 * 
 * @name GetUserById
 * @route {GET} /api/users/:id
 * @authentication JWT required
 * @routeparam {string} id - User ID
 * @returns {Object} User data
 */
router.get(":id", authenticate, userController.getUserById);

// admin only routes

/**
 * POST /api/users
 * Creates a new user.
 * Requires authentication and admin role.
 * 
 * @name CreateUser
 * @route {POST} /api/users
 * @authentication JWT required
 * @authorization Admin role required
 * @bodyparam {string} username - User's username
 * @bodyparam {string} password - User's password
 * @returns {Object} Success message
 */
router.post("/", authenticate, authorize(["admin"]), userController.createUser);

/**
 * DELETE /api/users/:id
 * Deletes a user by ID.
 * Requires authentication and admin role.
 * 
 * @name DeleteUser
 * @route {DELETE} /api/users/:id
 * @authentication JWT required
 * @authorization Admin role required
 * @routeparam {string} id - User ID
 * @returns {Object} Success message
 */
router.delete("/:id", authenticate, authorize(["admin"]), userController.deleteUser);

/**
 * PUT /api/users/:id/ban
 * Bans a user by ID.
 * Requires authentication and admin role.
 * 
 * @name BanUser
 * @route {PUT} /api/users/:id/ban
 * @authentication JWT required
 * @authorization Admin role required
 * @routeparam {string} id - User ID
 * @returns {Object} Success message
 */
router.put("/:id/ban", authenticate, authorize(["admin"]), userController.banUser);

/**
 * PUT /api/users/:id/unban
 * Unbans a user by ID.
 * Requires authentication and admin role.
 * 
 * @name UnbanUser
 * @route {PUT} /api/users/:id/unban
 * @authentication JWT required
 * @authorization Admin role required
 * @routeparam {string} id - User ID
 * @returns {Object} Success message
 */
router.put("/:id/unban", authenticate, authorize(["admin"]), userController.unbanUser);

/**
 * GET /api/users
 * Gets all users.
 * Requires authentication and admin role.
 * 
 * @name GetAllUsers
 * @route {GET} /api/users
 * @authentication JWT required
 * @authorization Admin role required
 * @returns {Object} Array of users
 */
router.get("/", authenticate, authorize(["admin"]), userController.getAllUsers);

/**
 * GET /api/users/:id
 * Gets a user by ID.
 * Requires authentication and admin role.
 * 
 * @name GetUserById
 * @route {GET} /api/users/:id
 * @authentication JWT required
 * @authorization Admin role required
 * @routeparam {string} id - User ID
 * @returns {Object} User data
 */
router.get("/:id", authenticate, authorize(["admin"]), userController.getUserById);

export { router };