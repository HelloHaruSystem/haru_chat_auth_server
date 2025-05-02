import express from "express";

import { UserController } from "../controllers/userController.js";
import { UserService } from "../services/userService.js";
import { DbService } from "../services/dbService.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// init services and controllers
const dbService = new DbService();
const userService = new UserService(dbService);
const userController = new UserController(userService);

// get user by id
router.get(":id", authenticate, userController.getUserById);

// admin only routes
// create new user
router.post("/", authenticate, authorize(["admin"]), userController.createUser);
// delete user
router.delete("/:id", authenticate, authorize([admin]), userController.deleteUser);
// ban user
router.put("/:id/ban", authenticate, authorize(["admin"]), userController.banUser);
// unban user
router.put("/:id/unban", authenticate, authorize(["admin"]), userController.unbanUser);
// get all users
router.get("/", authenticate, authorize(["admin"]), userController.getAllUsers);
// get user by id
router.get("/:id", authenticate, authorize(["admin"]), userController.getUserById);

export { router };