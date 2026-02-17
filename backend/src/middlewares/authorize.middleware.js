import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import roles from "../config/roles.js";

export const authorize = (module, action) =>
    asyncHandler(async (req, res, next) => {
        const user = req.user;

        if (!user) {
            throw new ApiError(401, "Unauthorized access");
        }

        const rolePermissions = roles[user.role];

        if (!rolePermissions) {
            throw new ApiError(
                403,
                "Role not found or no permissions assigned"
            );
        }

        const modulePermissions = rolePermissions[module];

        if (!modulePermissions || modulePermissions.length === 0) {
            throw new ApiError(403, "Access denied to this module");
        }

        if (
            !modulePermissions.includes("*") &&
            !modulePermissions.includes(action)
        ) {
            throw new ApiError(
                403,
                "You do not have permission to perform this action"
            );
        }

        next();
    });
