import express from "express";
import dotenv from "dotenv";

import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { router as authRoutes } from "./routes/authRoutes.js";
import { router as userRoutes } from "./routes/userRoutes.js";

// load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT;

// middleware for parsing JSON bodies
app.use(express.json());

// home route/root route
app.get("/", (req, res) => {
    res.send("Welcome to<br>Haru_chat auth and user management");
});

// routes
// auth route
app.use("/api/auth", authRoutes);
// user routes
app.use("/api/users", userRoutes);

// error handling
app.use(errorHandler);
app.use(notFoundHandler);

// start server
app.listen(port, () => {
    console.log(`Server starting on port: ${port}...`);
});