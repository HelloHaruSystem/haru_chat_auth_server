# Haru_Chat_Auth_Server

An authentication and user management server for Haru_Chat. This server provides authentication, registration, and management

> **Note:** This project is primarily for learning purposes, in building authentication systems with Node.js, Express, and PostgreSQL.

## Overview

Haru_Chat_Auth_Server is a Node.js/Express application that handles all authentication and user management operations for Haru_Chat. It works alongside the [Haru_Chat_Server](https://github.com/HelloHaruSystem/haru_chat_server) and integrates with the [Haru_Chat_Client](https://github.com/HelloHaruSystem/haru_chat_client) desktop application.

### Key Features

- User registration and authentication
- JWT-based authentication system
- Role-based access control (user/admin roles)
- User management (creation, retrieval, ban/unban)
- Password hashing with bcrypt
- PostgreSQL database integration

## Architecture

The project follows a layered architecture pattern:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Data Access**: Manage database operations
- **Middleware**: Process requests before they reach routes
- **Models**: Define data structures
- **Routes**: Define API endpoints
- **Utils**: Provide utility functions

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HelloHaruSystem/haru_chat_auth_server.git
   cd haru_chat_auth_server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=haru_chat
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   SALT_ROUNDS=salt_rounds
   SESSION_SECRET=your_session_secret
   ```

4. Set up the database:
   Create a PostgreSQL database named `haru_chat` and run the following SQL to create the needed tables:

   ```sql
   -- Users table
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(25) NOT NULL,
        password TEXT NOT NULL,
        created_at DATE DEFAULT NOW(),
        is_banned bool
    );

    -- Roles table
    CREATE TABLE roles (
        id INTEGER PRIMARY KEY,
        name VARCHAR(25)
    );

    -- Join table of users and roles
    CREATE TABLE user_roles (
        user_id INTEGER REFERENCES users(id),
        role_id INTEGER REFERENCES roles(id),

        PRIMARY KEY(user_id, role_id)
    );
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user
  - Request: `{ "username": "user", "password": "pass" }`
  - Response: `{ "success": true, "message": "User registered successfully", "user": {...} }`

- **POST** `/api/auth/login` - Login a user
  - Request: `{ "username": "user", "password": "pass" }`
  - Response: `{ "success": true, "message": "Login successful", "token": "JWT_TOKEN", "user": {...} }`

- **GET** `/api/auth/me` - Get current user (requires authentication)
  - Response: `{ "success": true, "user": {...} }`

### User Management (Admin only)

- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get a specific user
- **POST** `/api/users` - Create a new user
- **DELETE** `/api/users/:id` - Delete a user
- **PUT** `/api/users/:id/ban` - Ban a user
- **PUT** `/api/users/:id/unban` - Unban a user

## Integration with Haru_Chat

This authentication server provides the security layer for Haru_Chat.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Express.js for the web framework
- Bcrypt for password hashing
- JSON Web Tokens for authentication
- PostgreSQL for the database