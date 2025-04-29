import bcrypt from "bcrypt";
import { User } from "./../models/User";
import e from "express";

class UserService {
    constructor(db) {
        this._db = db;
        this._saltRounds = 10;
    }

    // hash password method
    async hashPassword(password) {
        try {
            return await bcrypt.hash(password, this._saltRounds);
        } catch (error) {
            throw new Error(`Error hashing password: ${error}`);
        }
    }

    // verify password method
    async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw new Error(`Error verifying password: ${error}`);
        }
    }

    // create a new user method
    async createUser(username, password) {
        try {
            // check if user exists
            const existingUser = await this.getUserByUsername(username);
            if (existingUser) {
                throw new Error(`Error user already exists: ${error}`);
            }

            // hash password
            const hashedPassword = await this.hashPassword(password);

            // create the user
            const user = new User(
                username,
                hashedPassword,
                new Date(),
                false
            );

            // TODO: implement saveUser function in the dbservice
            await this.db.saveUser(user);

            // return the newly created user
            return user.getSafeObject();
        } catch (error) {
            throw new Error(`Error creating new user: ${error}`);
        }
    }

    async getUserById(id) {
        try {
            if (typeof id !== "number") {
                throw new Error("id must be of type number");
            }
    
            const user = await db.getUserById(id);
            return user ? user.getSafeObject() : null;
        } catch (error) {
            throw new Error(`Error getting user by ID: ${error}`);
        }
    } 

    async getUserBuUsername(username) {
        try {
            if (typeof username !== "string") {
                throw new Error("username must be of type string");
            }

            const user = await db.getUserByUsername(username);
            return user ? user.getSafeObject() : null;
        } catch (error) {
            throw new Error(`Error getting user by username: ${error}`);
        }
    }
}