/**
 * Database and query config and utils
 * This Module provides a configured PostgreSQL connection pool
 * with a function to query
 * 
 * @module config/db
 */

import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;

// load environment variables
dotenv.config();

/**
 *  postgres DB pool
 */
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// test connection on startup
(async () => {
    try {
        const client = await pool.connect();
        console.log("Database connected successfully");
        client.release();
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
})();

/**
 * Executes a parameterized sql query on the database
 * 
 * @async
 * @param {string} text - sql commands
 * @param {Array} params - params for the query 
 * @returns {Promise<pg.QueryResult>} - Query result object
 * @throws {Error} - Logs database errors but doesn't throw them
 * @example
 * // simple query without parameters
 * const users = await query("SELECT * FROM users");
 * 
 * // simple query with parameters
 * const user = await query("SELECT * FROM USERS WHERE ID = $1", [userUd]);
 */
const query = async (text, params) => {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error("Database query error:", error)
    }
};

export { pool, query };