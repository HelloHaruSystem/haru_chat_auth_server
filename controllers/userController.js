import { ValidationError } from "../middleware/errorMiddleware.js";
import { UserService } from "../services/userService.js";

class UserController {
    constructor(userService) {
        this._userService = userService;
    }

    createUser = async (req, res, next) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                throw new ValidationError("Username and password are required");
            }

            const user = await this._userService.createUser(username, password);
            res.status(201).json({
                success: true,
                message: "User created successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    getUserById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            
            if (isNaN(id)) {
                throw new ValidationError("Invalid id");
            }
            
            // Check if user is admin or requesting their own information
            if (!req.user.roles.includes("admin") && req.user.userId !== id) {
                throw new ForbiddenError("You can only access your own user data");
            }
            
            const user = await this._userService.getUserById(id);
            
            if (!user) {
                throw new NotFoundError("User not found");
            }
            
            res.json({
                success: true,
                user
            });
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            
            if (isNaN(id)) {
                throw new ValidationError("Invalid id");
            }
            
            const result = await this._userService.deleteUserById(id);
            
            if (!result) {
                throw new NotFoundError("User not found or couldn't be deleted");
            }
            
            res.json({
                success: true,
                message: "User deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    banUser = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            
            if (isNaN(id)) {
                throw new ValidationError("Invalid user ID");
            }
            
            const result = await this._userService.banUser(id);
            
            if (!result) {
                throw new NotFoundError("User not found or could not be banned");
            }
            
            res.json({
                success: true,
                message: "User banned successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    unbanUser = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            
            if (isNaN(id)) {
                throw new ValidationError("Invalid id");
            }
            
            const result = await this._userService.unbanUser(id);
            
            if (!result) {
                throw new NotFoundError("User not found or could not be unbanned");
            }
            
            res.json({
                success: true,
                message: "User unbanned successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    getAllUsers = async (req, res, next) => {
        try {
            const users = await this._userService.getAllUsers();

            res.json({
                success: true,
                users,
            });
        } catch (error) {
            next(error);
        }
    };
}

export { UserController };