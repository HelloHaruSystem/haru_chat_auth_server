// db stuff
import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;

// load environment variables
dotenv.config();

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

// query method
const query = async (text, params) => {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error("Database query error:", error)
    }
};

export { pool, query };