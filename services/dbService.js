/**
 * Database service for Haru_chat
 * Handles database operations ofr users and roles,
 * including initialization, CRUD and data mapping
 * 
 * @module services/dbService
 */

import { pool, query } from "./../config/db.js"
import { User } from "./../models/User.js";
import { NotFoundError } from "./../middleware/errorMiddleware.js";

/**
 * Service class for database operations
 */
class DbService {
    /**
     * Constructor method
     * creates a new instance of DbService
     * and initializes the database if needed.
     */
    constructor() {
        // init database
        this.init().catch(error => {
            console.error("database init error:", error);
        });
    }

    /**
     * Initializes the database by creating default roles if needed
     * 
     * @async
     * @private
     */
    async init() {
        try {
            const roleCount = await this.countRoles();

            if (roleCount === 0) {
                // insert the two default roles user and admin
                await pool.query(
                    `INSERT INTO roles (id, name)
                    VALUES ($1, $2), ($3, $4)`,
                    [1, "user", 2, "admin"]
                );
                console.log("Defualt roles has been created");
            }
        } catch (error) {
            console.error("Failed to initialize roles:", error);
        }
    }

    /**
     * Counts the number of roles in the database
     * 
     * @async
     * @returns {Promise<number>} The amount of roles 
     */
    async countRoles() {
        const result = await pool.query(
            `SELECT COUNT(*) FROM roles`
        );
        return parseInt(result.rows[0].count, 10);
    }

    /**
     * Saves a user to the database.
     * 
     * @param {User} user - User Object to save
     * @returns {Promise<number>} ID generated by the database of the new user
     * @throws {Error} If saving fails
     */
    async saveUser(user) {
        const client = await pool.connect();

        try {
            // Starts transaction 
            await client.query("BEGIN");

            // returning id means that it will return the id that the database generates
            const userResult = await client.query(
                `INSERT INTO users (username, password, created_at, is_banned)
                VALUES ($1, $2, $3, $4) RETURNING id`,
                [user.getUsername(), user._password, user.getCreatedAt(), user.getIsBanned()]
            );

            const userId = userResult.rows[0].id;

            // assign the default role which i user
            await client.query(
                `INSERT INTO user_roles (user_id, role_id)
                VALUES ($1, $2)`,
                [userId, 1]
            );

            // commit to the transaction
            await client.query("COMMIT");
            return userId;
        } catch (error) {
            // incase of error roll back the changes and end the transaction
            await client.query("ROLLBACK");
            console.error("Error saving user: ", error);
            throw error;
        } finally {
            // lastly close the connection
            client.release();
        }
    }

    /**
     * Gets a user by ID from the database.
     * 
     * @async
     * @param {number} id - User ID to look up
     * @returns {Promise<User|null>} User object or null if not found
     * @throws {Error} If retrieval fails
     */
    async getUserById(id) {
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT u.*, array_agg(r.name) AS roles FROM users u
                LEFT JOIN user_roles AS ur ON u.id = ur.user_id
                LEFT JOIN roles AS r ON r.id = ur.role_id
                WHERE u.id = $1
                GROUP BY u.id`,
                [id]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return this._mapDbUserToModel(result.rows[0]);
        } catch (error) {
            console.error("Error fetching users", error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Gets a user by username from the database.
     * 
     * @async
     * @param {string} username - Username to look up
     * @returns {Promise<User|null>} User object or null if not found
     * @throws {Error} If retrieval fails
     */
    async getUserByUsername(username) {
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT u.*, array_agg(r.name) AS roles FROM users u
                LEFT JOIN user_roles AS ur ON u.id = ur.user_id
                LEFT JOIN roles AS r On ur.role_id = r.id
                WHERE u.username = $1
                GROUP BY u.id`,
                [username]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return this._mapDbUserToModel(result.rows[0]);
        } catch (error) {
            console.error("Error fetching user", error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Gets all users from the database.
     * 
     * @async
     * @returns {Promise<User[]>} Array of user objects
     * @throws {Error} If retrieval fails
     */
    async getAllUsers() {
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT u.* array_agg(r.name) AS roles FROM users u
                LEFT JOIN user_roles AS ur ON u.id = ur.user_id
                LEFT JOIN roles AS r ON r.id = ur.role_id
                GROUP BY u.id`
            );

            return result.rows.map(row => this._mapDbUserToModel(row));
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            client.release();
        }
    }

    /**
     * Deletes a user by ID.
     * 
     * @async
     * @param {number} id - ID of user to delete
     * @returns {Promise<boolean>} Whether deletion was successful
     * @throws {NotFoundError} If user not found
     * @throws {Error} If deletion fails
     */
    async deleteUser(id) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await client.query(`
                DELETE FROM user_roles
                WHERE user_id = $1`,
                [id]
            );

            const result = await client.query(
                `DELETE FROM users
                WHERE id = $1 RETURNING id`,
                [id]
            );

            await client.query("COMMIT");

            if (result.rows.length === 0) {
                throw new NotFoundError("User not found");
            }

            return true;
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Error deleting user", error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Maps a database user record to a User model.
     * 
     * @private
     * @param {Object} dbUser - Database user record
     * @returns {User} User model instance
     */
    _mapDbUserToModel(dbUser) {
        // create the user 
        const user = new User(
            dbUser.id,
            dbUser.username,
            dbUser.password,
            new Date(dbUser.created_at),
            dbUser.is_banned
        );

        // add roles to the user
        if (dbUser.roles && Array.isArray(dbUser.roles)) {
            const roles = dbUser.roles.filter(role => role !== null);
            user.setRoles(roles);
        } else {
            user.setRoles([]);
        }

        return user;
    }

    /**
     * Bans a user by ID.
     * 
     * @async
     * @param {number} id - ID of user to ban
     * @returns {Promise<boolean>} Whether ban was successful
     * @throws {NotFoundError} If user not found
     * @throws {Error} If ban fails
     */
    async banUser(id) {
        const client = await pool.connect();
        
        try {
            const result = await client.query(
                `UPDATE users SET is_banned = true
                WHERE id = $1 RETURNING id`,
                [id]
            );
            
            if (result.rows.length === 0) {
                throw new NotFoundError("User not found");
            }
            
            return true;
        } catch (error) {
            console.error("Error banning user", error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Unbans a user by ID.
     * 
     * @async
     * @param {number} id - ID of user to unban
     * @returns {Promise<boolean>} Whether unban was successful
     * @throws {NotFoundError} If user not found
     * @throws {Error} If unban fails
     */
    async unbanUser(id) {
        const client = await pool.connect();

        try {
            const result = await client.query(
                `UPDATE users
                SET is_banned = false
                WHERE ID = $1 RETURNING id`,
                [id]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("User not found");
            }

            return true;
        } catch (error) {
            console.error("Error trying to unban user", error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Gets a user's ban status by ID.
     * 
     * @async
     * @param {number} id - ID of user to check
     * @returns {Promise<boolean>} Whether the user is banned
     * @throws {NotFoundError} If user not found
     * @throws {Error} If retrieval fails
     */
    async getBanStatus(id) {
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT is_banned FROM users
                WHERE id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("User not found");
            }

            return result.rows[0].is_banned;
        } catch (error) {
            console.error("Error getting ban status", error);
            throw error;
        } finally {
            client.release();
        }
    }
}

export { DbService };