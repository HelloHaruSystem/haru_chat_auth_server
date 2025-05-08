/**
 * Main application entry point for Haru_Chat_Auth_Server
 * Sets up Express server, middleware and routes.
 * 
 * @module app
 */

import express from "express";
import dotenv from "dotenv";

import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { router as authRoutes } from "./routes/authRoutes.js";
import { router as userRoutes } from "./routes/userRoutes.js";

// load environment variables
dotenv.config();

/**
 * Express application instance.
 * @type {express.Application}
 */
const app = express();

/**
 * Server port from .env file
 * @type {string|number}
 */
const port = process.env.PORT;

// middleware for parsing JSON bodies
app.use(express.json());

/**
 * Home route handler
 * 
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
app.get("/", (req, res) => {
    res.send(`<h1>Welcome to Haru_chat auth and user management</h1>
        <h3>Please check the README.md at my <a href="https://github.com/HelloHaruSystem/haru_chat_auth_server/" target="_blank" rel="noopener noreferrer">github</a> :)</h3>`);
});

// routes
// auth route
app.use("/api/auth", authRoutes);
// user routes
app.use("/api/users", userRoutes);

// error handling
app.use(errorHandler);
app.use(notFoundHandler);

/**
 * Start the Express server.
 * 
 * @listens {number} port - the port to listen on
 * @event listening - Emitted when server starts listening
 */
app.listen(port, async () => {
    console.log(`Server starting on port: ${port}...`);
});