import express from "express";
import dotenv from "dotenv";

import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { DbService } from "./services/dbService.js";
import { UserService } from "./services/userService.js";
import { router as authRoutes } from "./routes/authRoutes.js";
import { authenticate, authorize } from "./middleware/authMiddleware.js";

// load environment variables
dotenv.config();

// init services
const dbService = new DbService();
const userService = new UserService(dbService);

const app = express();
const port = process.env.PORT;

// middleware for parsing JSON bodies
app.use(express.json());

// routes
app.get("/", (req, res) => {
    res.send("User management");
});

// auth routes
app.use("/api/auth", authRoutes);

// protected routes
app.post("/api/users", authenticate, authorize(["admin"]), async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const user = await userService.createUser(username, password);
        res.status(201).json({
            success: true,
            message: "User created successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error creating user ${error}`
        });
    }
});


app.get("/api/users/:id", authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid id"
            });
        }

        // check if user is admin or requesting their own information
        if (!req.user.roles.includes("admin") && req.user.userId !== id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - You can only access your won user data"
            });
        }

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error fetching user: ${error}`
        });
    }
})

app.delete("/api/users/:id", authenticate, authorize(["admin"]), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid id"
            });
        }

        const result = await userService.deleteUserById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found or user couldn't be deleted"
            });
        }

    
        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error deleting user: ${error}`
        });
    }
});

/*
app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const result = await userService.authenticateUser(username, password);

        if (!result.success) {
            return res.status(401).json(result);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Authentication error`
        })
    }
});
*/

app.put("/api/users/:id/ban", authenticate, authorize(["admin"]), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        
        if (isNaN(id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid user ID" 
            });
        }
        
        const result = await userService.banUser(id);
        
        if (!result) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found or could not be banned" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "User banned successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: `Error banning user: ${error.message}` 
        });
    }
});

app.put("/api/users/:id/unban", authenticate, authorize(["admin"]), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid id"
            });
        }

        const result = await userService.unbanUser(id);
        
        if (!result) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found or could not be unbanned" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "User unbanned successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: `Error unbanning user: ${error.message}` 
        });
    }
});

app.use(errorHandler);
app.use(notFoundHandler);

// start server
app.listen(port, () => {
    console.log(`Server starting on port: ${port}`);
})