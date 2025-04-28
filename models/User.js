// user model definition goes here
class User {
    constructor(id, username, password, createdAt, isBanned) {
        if (typeof id !== "number") {
            throw new Error("id must be a number");
        }
        this._id = id;

        if (typeof username !== "string" && username.trim() === "") {
            throw new Error("username must be a string and not empty");
        }
        this._username = username;

        if (typeof password !== "string" && password.trim() === "") {
            throw new Error("password can't be empty");
        }
        this._password = password; // this will be hashed before storage

        if (!(createdAt instanceof Date)) {
            throw new Error("createdAt must be a Date object");
        }
        this._createdAt = createdAt;

        if (typeof isBanned !== "boolean") {
            throw new Error("isBanned must be a boolean");
        }
        this._isBanned = isBanned;
    }

    getId() {
        return this._id;
    };

    setId(id) {
        if (typeof username !== "string" && username.trim() === "") {
            throw new Error("username must be a string and not empty");
        }
        this._id = id;
    };

    getUsername() {
        return this._username;
    };

    setUsername(username) {
        if (typeof username !== "string" && username.trim() === "") {
            throw new Error("username must be a string and not empty");
        }
        this._username = username;
    };

    // this needs to get hashed before storage
    setPassword(password) {
        this._password = password;
    };

    getCreatedAt() {
        return this._createdAt;
    };

    getIsBanned() {
        return this._isBanned;
    };

    setIsBanned(banned) {
        if (typeof banned !== "boolean") {
            throw new Error("isBanned must be a boolean");
        }
        this._isBanned = banned;
    };

    // returns user object without password
    getSafeObject() {
        return {
            id: this._id,
            username: this._username,
            createdAt: this._createdAt,
            isBanned: this._isBanned
        };
    };
};