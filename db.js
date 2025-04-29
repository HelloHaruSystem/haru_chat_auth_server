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

// test connection
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Error connecting to database: ", err);
    } else {
        console.log("Database connected successfully");
    }
    pool.end();
});

// query method
const query = (text, params) => {
    pool.query(text, params);
};

export { pool, query };