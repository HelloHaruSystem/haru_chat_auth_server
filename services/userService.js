/**
 * User service for Haru_chat
 * handles user management stuff including creation, retrieval,
 * password hashing and user authentication
 * 
 * @module services/userService
 */

import bcrypt from "bcrypt";

import { User } from "./../models/User.js";

/**
 * Service class for handling user-related stuff
 */
class UserService {
    /**
     * Constructor method for UserService.
     * Creates a new instance of UserService
     * 
     * @param {Object} db - DB service instance
     */
    constructor(db) {
        this._db = db;
        this._saltRounds = 10;
    }

    /**
     * Method for hashing passwords using bcrypt
     * 
     * @async 
     * @param {string} password - password in plaintext to hash
     * @returns {Promise<string>} hashed password
     * @throws {Error} If password is not of type string or hashing fails
     */
    async hashPassword(password) {
        if (typeof password !== "string") {
            throw new Error("username and password must be of type string");
        }
        try {
            return await bcrypt.hash(password, this._saltRounds);
        } catch (error) {
            throw new Error(`Error hashing password: ${error}`);
        }
    }

    /**
     * Method for verifying passwords
     * 
     * @async
     * @param {string} password - plain text password you want to verify
     * @param {string} hashedPassword  - Hashed password to compare with the plain text password given
     * @returns {Promise<boolean>} boolean representing if the passwords matches
     * @throws {Error} If verification fails
     */
    async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw new Error(`Error verifying password: ${error}`);
        }
    }

    /**
     * Create a new user.
     * 
     * @async
     * @param {string} username - username for the new user
     * @param {string} password - Plain text password of a new user (this will be hashed)
     * @returns {Promise<Object>} - Returns a Safe user object without the password
     * @throws {Error} If validation fails or user already exists
     */
    async createUser(username, password) {
        try {
            if (typeof username !== "string" || typeof password !== "string") {
                throw new Error("username and password must be of type string");
            }

            // check if user exists
            const existingUser = await this.getUserByUsername(username);
            if (existingUser) {
                throw new Error(`Error user already exists:`);
            }

            // hash password
            const hashedPassword = await this.hashPassword(password);

            // create the user
            const user = new User(
                null,
                username,
                hashedPassword,
                new Date(),
                false
            );

            // TODO: implement saveUser function in the dbService
            const userId = await this._db.saveUser(user);

            // set the ID given by the db
            user.setId(userId);

            // return the newly created user
            return user.getSafeObject();
        } catch (error) {
            throw new Error(`Error creating new user: ${error}`);
        }
    }

    /**
     * Gets a user by ID 
     * 
     * @async
     * @param {number} id - ID of the user you want to get
     * @returns {Promise<Object|null>} Safe User object without password or null if not found
     * @throws {Error} If user couldn't be retrieved or ID is not of type number
     */
    async getUserById(id) {
        try {
            if (typeof id !== "number") {
                throw new Error("id must be of type number");
            }
    
            const user = await this._db.getUserById(id);
            return user ? user.getSafeObject() : null;
        } catch (error) {
            throw new Error(`Error getting user by ID: ${error}`);
        }
    } 

    /**
     * Gets all users
     * 
     * @async
     * @returns {Promise<Object[]>} Array of safe user objects not containing passwords
     * @throws {Error} If retrieval fails
     */
    async getAllUsers() {
        try {
            const users = await this._db.getAllUsers();

            // map to safe objects
            return users.map(user => user.getSafeObject());
        } catch (error) {
            throw new Error(`Error fetching all users: ${error}`);
        }
    }

    /**
     * Gets a user by username
     * 
     * @async
     * @param {string} username - Username of the user you want to retrieve
     * @returns {Promise<Object|null>} Safe User object without password or null if not found
     * @throws {Error} If user couldn't be retrieved or username is not of type string
     */
    async getUserByUsername(username) {
        try {
            if (typeof username !== "string") {
                throw new Error("username must be of type string");
            }

            const user = await this._db.getUserByUsername(username);
            return user ? user.getSafeObject() : null;
        } catch (error) {
            throw new Error(`Error getting user by username: ${error}`);
        }
    }

    /**
     * Deletes a user by ID
     * 
     * @async
     * @param {number} id - ID of the user to delete
     * @returns {Promise<boolean>} weather deletion was successful
     * @throws {Error} If deletion fails or id is not of type number
     */
    async deleteUserById(id) {
        try {
            if (typeof id !== "number") {
                throw new Error("id must be of type number");
            }

            return await this._db.deleteUser(id);
        } catch (error) {
            throw new Error(`Error deleting user: ${error}`);
        }
    }

    /**
     * Bans a user by ID
     * 
     * @async
     * @param {number} id - ID of the user to ban
     * @returns {Promise<boolean>} weather ban was successful or not
     * @throws {Error} if ban fails or id is not of type number
     */
    async banUser(id) {
        try {
            if (typeof id !== "number") {
                throw new Error("id must be of type number");
            }

            return await this._db.banUser(id);
        } catch (error) {
            throw new Error(`Error trying to ban user with ID ${id}: ${error}`);
        }
    }

    /**
     * Unbans a user by ID
     * 
     * @async
     * @param {number} id - ID of the user to unban
     * @returns {Promise<boolean>} weather unban was successful or not
     * @throws {Error} if unban fails or id is not of type number
     */
    async unbanUser(id) {
        try {
            if (typeof id !== "number") {
                throw new Error("id must be of type number");
            }

            return await this._db.unbanUser(id);
        } catch (error) {
            throw new Error (`Error trying to unban user with ID ${id}: ${error}`);
        }
    }

    /**
     * Gets a user's ban status by ID
     * 
     * @param {number} id - ID of the user to check
     * @returns {Promise<boolean>} Weather the user is banned or not
     * @throws {Error} If check fails or id is not of type number
     */
    async getUserBanStatus(id) {
        try {
            if (typeof id !== "number") {
                throw new Error("id must be of type number");
            }

            return await this._db.getBanStatus(id);
        } catch (error) {
            throw new Error(`Error fetching ban status of user with ID ${id}: ${error}`);
        }
    }

    /**
     * Authenticate a user by username and password.
     * 
     * @async
     * @param {string} username - username to authenticate
     * @param {string} password - plain text password to verify
     * @returns {Promise<Object>} Authenticate result with a success flag and user data
     * @throws {Error} If input validation fails or authentication errors happens
     */
    async authenticateUser(username, password) {
        try {
            if (typeof username !== "string" || typeof password !== "string") {
                throw new Error("username and password must be of type string");
            }

            const user = await this._db.getUserByUsername(username);

            if (!user) {
                return {
                    success: false,
                    message: "User not found"
                };
            }

            if (user.getIsBanned()) {
                return {
                    success: false,
                    message: "user has been banned"
                };
            }

            const isPasswordValid = await this.verifyPassword(password, user._password);

            if (!isPasswordValid) {
                return {
                    success: false,
                    message: "invalid password"
                };
            }

            return {
                success: true,
                message: "Authentication successful",
                user: user.getSafeObject()
            };
        } catch (error) {
            throw new Error(`Error trying to Authenticate user ${username}: ${error}`);
        }
    }
}

export { UserService };