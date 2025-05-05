/**
 * Authentication configuration for Haru_Chat.
 * Provides configuration constants for JWT, password hashing and sessions.
 * 
 * @module config/auth
 */

import dotenv from "dotenv";

// load .env file
dotenv.config();

/**
 * contains jwt secret and expiresIn from .env
 */
const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
};

/**
 * contains salt rounds for bcrypt from .env file
 */
const passwordConfig = {
    saltRounds: process.env.SALT_ROUNDS || 10,
};

/**
 * contains the sessions configs
 *  such as cookie name, secret and the duration of the session
 */
const sessionConfig = {
    cookieName: 'auth_session',
    secret: process.env.SESSION_SECRET,
    duration: 24 * 60 * 60 * 1000 // 24 hours
};

export { jwtConfig, passwordConfig, sessionConfig };