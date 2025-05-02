import express from "express";

import { AuthService } from "../services/authService.js";
import { AuthController } from "../controllers/authController.js";
import { UserService } from "../services/userService.js";
import { DbService } from "../services/dbService.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

// creates the router
const router = express.Router();

// initialize services and controller
const dbService = new DbService();
const userService = new UserService(dbService);
const authService = new AuthService(userService);
const authController = new AuthController(authService);

// public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// protected routes
router.get("/me", authenticate, authController.getCurrentUser);

// Admin only routes
router.get("/users", authenticate, authorize(["admin"]), async (req, res, next) => {
    try {
        //TODO: Move this to a userController
        res.json({
            success: true,
            message: "Admin only - list of users goes here"
        });
    } catch (error) {
        next(error);
    }
});

export { router };