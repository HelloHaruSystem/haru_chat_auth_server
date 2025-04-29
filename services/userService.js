import bcrypt from "bcrypt";
import { User } from "./../models/User";

class UserService {
    constructor(db) {
        this._db = db;
        this._saltRounds = 10;
    }

    // hash password method
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