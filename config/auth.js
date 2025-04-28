import dotenv from "dotenv";

// load .env file
dotenv.config();

const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
};

const passwordConfig = {
    saltRounds: process.env.SALT_ROUNDS || 10,
};

const sessionConfig = {
    cookieName: 'auth_session',
    secret: process.env.SESSION_SECRET,
    duration: 24 * 60 * 60 * 1000 // 24 hours
};

export { jwtConfig, passwordConfig, sessionConfig };