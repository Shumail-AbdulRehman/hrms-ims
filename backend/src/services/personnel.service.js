import Personnel from "../models/personnel.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

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

    if (creatorRole === "admin") {
        data.unit = creatorUnit;
    } else {
        if (data.unit) {
            data.unit = new mongoose.Types.ObjectId(data.unit);
        } else {
            throw new ApiError(400, "Unit is required");
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

const getPersonnelService = async (creatorRole, creatorUnit) => {
    const filter = {};
    if (creatorRole === "admin") {
        filter.unit = creatorUnit;
    }

    const personnel = await Personnel.find(filter)
        .select("-password -refreshToken")
        .populate("unit", "name code")
        .populate("supervisor", "employeeId firstName lastName")
        .sort({ createdAt: -1 });

    return personnel;
};

const getPersonnelByIdService = async (id, creatorRole, creatorUnit) => {
    const personnel = await Personnel.findById(id)
        .select("-password -refreshToken")
        .populate("unit", "name code")
        .populate("supervisor", "employeeId firstName lastName");

    if (!personnel) throw new ApiError(404, "Personnel not found");

    if (creatorRole === "admin" && String(personnel.unit._id || personnel.unit) !== String(creatorUnit)) {
        throw new ApiError(403, "Personnel does not belong to your unit");
    }

    return personnel;
};

const updatePersonnelService = async (id, data, creatorRole, creatorUnit) => {
    const personnel = await Personnel.findById(id);
    if (!personnel) throw new ApiError(404, "Personnel not found");

    if (creatorRole === "admin" && String(personnel.unit) !== String(creatorUnit)) {
        throw new ApiError(403, "Personnel does not belong to your unit");
    }

    if (creatorRole === "admin" && data.unit) {
        throw new ApiError(403, "Admin cannot transfer personnel to another unit");
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
