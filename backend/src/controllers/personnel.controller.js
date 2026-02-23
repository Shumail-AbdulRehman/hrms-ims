import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import {
    signInService,
    createPersonnelService,
    getPersonnelService,
    getPersonnelByIdService,
    updatePersonnelService,
} from "../services/personnel.service.js";

const VALID_ROLES = [
    "super_admin", "admin", "sub_admin", "sdo", "sub_engineer",
    "supervisor", "employee", "store_manager", "inventory_operator", "ims_audit_officer"
];

const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const signIn = asyncHandler(async (req, res) => {
    const result = signInSchema.safeParse(req.body);

    if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.errors);
    }

    const { email, password } = result.data;
    const loginData = await signInService(email, password);

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", loginData.accessToken, options)
        .cookie("refreshToken", loginData.refreshToken, options)
        .json(new ApiResponse(200, loginData, "User logged in successfully"));
});

const createPersonnelSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    cnic: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email"),
    password: z.string().min(6).optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
    unit: z.string().optional(),
    role: z.enum(VALID_ROLES, { message: "Invalid role" }),
    employeeType: z.enum(["permanent", "contract"]).default("permanent"),
    joiningDate: z.coerce.date().optional(),
    supervisor: z.string().optional(),
    emergencyContact: z.string().optional(),
});

const createPersonnel = asyncHandler(async (req, res) => {
    const parsed = createPersonnelSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const creatorRole = req.user.role;
    const creatorUnit = req.user.unit;

    // admin and sub_admin can only create in their own unit
    const unitScopedCreators = ["admin", "sub_admin"];
    if (unitScopedCreators.includes(creatorRole) && parsed.data.unit && String(parsed.data.unit) !== String(creatorUnit)) {
        throw new ApiError(403, "You can only create personnel in your own unit");
    }

    if (creatorRole === "super_admin" && !parsed.data.unit) {
        throw new ApiError(400, "Super Admin must specify a unit for the new personnel");
    }

    const personnel = await createPersonnelService(parsed.data, creatorRole, creatorUnit);

    res.status(201).json(
        new ApiResponse(201, personnel, "Personnel created successfully")
    );
});

const updatePersonnelSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    cnic: z.string().optional(),
    phone: z.string().optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
    unit: z.string().optional(),
    role: z.enum(VALID_ROLES).optional(),
    employeeType: z.enum(["permanent", "contract"]).optional(),
    joiningDate: z.coerce.date().optional(),
    supervisor: z.string().optional(),
    emergencyContact: z.string().optional(),
    status: z.enum(["active", "inactive", "resigned", "retired", "terminated"]).optional(),
});

const updatePersonnel = asyncHandler(async (req, res) => {
    const parsed = updatePersonnelSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const personnel = await updatePersonnelService(
        req.params.id, parsed.data, req.user.role, req.user.unit
    );

    res.status(200).json(
        new ApiResponse(200, personnel, "Personnel updated successfully")
    );
});

const getPersonnel = asyncHandler(async (req, res) => {
    const personnel = await getPersonnelService(req.user.role, req.user.unit);

    res.status(200).json(
        new ApiResponse(200, personnel, "Personnel fetched successfully")
    );
});

const getPersonnelById = asyncHandler(async (req, res) => {
    const personnel = await getPersonnelByIdService(
        req.params.id, req.user.role, req.user.unit
    );

    res.status(200).json(
        new ApiResponse(200, personnel, "Personnel fetched successfully")
    );
});

export {
    signIn,
    createPersonnel,
    updatePersonnel,
    getPersonnel,
    getPersonnelById,
};
