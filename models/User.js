class User {
    constructor(id, username, password, createdAt, isBanned) {
        if (id !== null && typeof id !== "number") {
            throw new Error("id must be a number");
        }
        this._id = id;

        if (typeof username !== "string" || username.trim() === "") {
            throw new Error("username must be a string and not empty");
        }
        this._username = username;

        if (typeof password !== "string" || password.trim() === "") {
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

        this._roles = [];
    }

    getId() {
        return this._id;
    };

    setId(id) {
        if (id !== null && typeof id !== "number") {
            throw new Error("id must be a number");
        }
        this._id = id;
    };

    getUsername() {
        return this._username;
    };

    setUsername(username) {
        if (typeof username !== "string" || username.trim() === "") {
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

    // 3 dots is the spread operator used to create a new array so we don't accidentally modify the original array
    getRoles() {
        return[...this._roles];
    };

    setRoles(roles) {
        if (!Array.isArray(roles)) {
            throw new Error("Error: roles must be of type array");
        }

        this._roles = [...roles];
    };

    hasRole(roleName) {
        return this._roles.includes(roleName);
    };

    addRole(roleName) {
        if (!this._roles.includes(roleName)) {
            this._roles.push(roleName);
        }
    }

    isAdmin() {
        return this._roles.includes("admin");
    }

    removeRole(roleName) {
        if (typeof roleName !== "string" || roleName.trim() === "") {
            throw new Error("Error role must be of type string and not empty");
        }

        const index = this._roles.indexOf(roleName);
        if (index !== -1) {
            this._roles.splice(index, 1);
        }
    };

    // returns user object without password
    getSafeObject() {
        return {
            id: this._id,
            username: this._username,
            createdAt: this._createdAt,
            isBanned: this._isBanned,
            roles: this.getRoles()
        };
    };
};

export { User };