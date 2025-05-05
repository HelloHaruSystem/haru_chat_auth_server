/**
 * JSON Web Token (JWT) utilities for authentication
 * provides functions for generating, verifying and extracting JWT's
 * 
 * @module utils/jwtUtils
 */

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Generates a JWT with the provided payload.
 * 
 * @param {Object} payload - Data to be encoded in the JWT
 * @param {number} payload.userId - User ID
 * @param {string} payload.username - Username
 * @param {string[]} payload.roles - User roles
 * @returns {string} Signed JWT
 */
const generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};

/**
 * Verifies a JWT's signature and expiration.
 * 
 * @param {string} token - JWT to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error("Error verifying token", error);
        throw error;
    }
};

/**
 * Extracts JWT from the Authorization header.
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} the extracted JWT if not found null is returned
 */
const extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
};

export { generateToken, verifyToken, extractToken };