import Personnel from "../models/personnel.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

// Roles that are scoped to their own unit (auto-assign unit from creator)
const UNIT_SCOPED_CREATORS = ["admin", "sub_admin"];

// Roles that can only have ONE active person per unit
const ONE_PER_UNIT_ROLES = ["admin", "sub_admin"];

const signInService = async (email, password) => {
    const personnel = await Personnel.findOne({ email }).select("+password");

    if (!personnel) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await personnel.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Password incorrect");
    }

    const accessToken = await personnel.generateAccessToken();
    const refreshToken = await personnel.generateRefreshToken();

    personnel.refreshToken = refreshToken;
    await personnel.save({ validateBeforeSave: false });

    const loggedInPersonnel = await Personnel.findById(personnel._id).select(
        "-password -refreshToken"
    );

    return {
        personnel: loggedInPersonnel,
        accessToken,
        refreshToken,
    };
};

const createPersonnelService = async (data, creatorRole, creatorUnit) => {
    const existing = await Personnel.findOne({ email: data.email });
    if (existing) {
        throw new ApiError(400, "Email already exists");
    }

    // Unit-scoped creators auto-assign their own unit
    if (UNIT_SCOPED_CREATORS.includes(creatorRole)) {
        data.unit = creatorUnit;
    } else {
        if (data.unit) {
            data.unit = new mongoose.Types.ObjectId(data.unit);
        } else {
            throw new ApiError(400, "Unit is required");
        }
    }

    // Enforce: only 1 admin / 1 sub_admin per unit
    if (ONE_PER_UNIT_ROLES.includes(data.role)) {
        const targetUnit = data.unit;
        const existingInRole = await Personnel.findOne({
            role: data.role,
            unit: targetUnit,
            status: "active",
        });
        if (existingInRole) {
            throw new ApiError(
                400,
                `Only one active ${data.role} is allowed per unit. Current: ${existingInRole.firstName} ${existingInRole.lastName}`
            );
        }
    }

    if (data.supervisor) data.supervisor = new mongoose.Types.ObjectId(data.supervisor);

    const personnel = await Personnel.create({
        ...data,
        password: data.password || "changeme123",
    });

    const createdPersonnel = await Personnel.findById(personnel._id).select("-password -refreshToken");

    return createdPersonnel;
};

const getPersonnelService = async (userRole, userUnit) => {
    const filter = {};

    // Unit-scoped roles only see their own unit
    if (userRole !== "super_admin") {
        filter.unit = userUnit;
    }

    const personnel = await Personnel.find(filter)
        .select("-password -refreshToken")
        .populate("unit", "name code")
        .populate("supervisor", "employeeId firstName lastName")
        .sort({ createdAt: -1 });

    return personnel;
};

const getPersonnelByIdService = async (id, userRole, userUnit) => {
    const personnel = await Personnel.findById(id)
        .select("-password -refreshToken")
        .populate("unit", "name code")
        .populate("supervisor", "employeeId firstName lastName");

    if (!personnel) throw new ApiError(404, "Personnel not found");

    // Non-super_admin can only view personnel in their own unit
    if (
        userRole !== "super_admin" &&
        String(personnel.unit._id || personnel.unit) !== String(userUnit)
    ) {
        throw new ApiError(403, "Personnel does not belong to your unit");
    }

    return personnel;
};

const updatePersonnelService = async (id, data, userRole, userUnit) => {
    const personnel = await Personnel.findById(id);
    if (!personnel) throw new ApiError(404, "Personnel not found");

    // Unit-scoped roles can only update personnel in their own unit
    if (
        userRole !== "super_admin" &&
        String(personnel.unit) !== String(userUnit)
    ) {
        throw new ApiError(403, "Personnel does not belong to your unit");
    }

    // Only super_admin can transfer personnel to another unit
    if (userRole !== "super_admin" && data.unit) {
        throw new ApiError(403, "Only super_admin can transfer personnel to another unit");
    }

    // If changing role to a one-per-unit role, enforce the constraint
    if (data.role && ONE_PER_UNIT_ROLES.includes(data.role)) {
        const targetUnit = data.unit || personnel.unit;
        const existingInRole = await Personnel.findOne({
            role: data.role,
            unit: targetUnit,
            status: "active",
            _id: { $ne: personnel._id },
        });
        if (existingInRole) {
            throw new ApiError(
                400,
                `Only one active ${data.role} is allowed per unit`
            );
        }
    }

    if (data.unit) data.unit = new mongoose.Types.ObjectId(data.unit);
    if (data.supervisor) data.supervisor = new mongoose.Types.ObjectId(data.supervisor);

    const fieldsToUpdate = { ...data };
    delete fieldsToUpdate.password;
    delete fieldsToUpdate.email;

    Object.assign(personnel, fieldsToUpdate);
    await personnel.save();

    const updated = await Personnel.findById(id)
        .select("-password -refreshToken")
        .populate("unit", "name code")
        .populate("supervisor", "employeeId firstName lastName");

    return updated;
};

export {
    signInService,
    createPersonnelService,
    getPersonnelService,
    getPersonnelByIdService,
    updatePersonnelService,
};
