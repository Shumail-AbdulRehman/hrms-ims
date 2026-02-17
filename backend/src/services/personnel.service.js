import Personnel from "../models/personnel.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";





const signUpService = async (data) => {
    const existing = await Personnel.findOne({ email: data.email });
    if (existing) {
        throw new ApiError(400, "Email already exists");
    }

    // Convert string IDs to ObjectId
    if (data.unit) data.unit = new mongoose.Types.ObjectId(data.unit);
    if (data.supervisor) data.supervisor = new mongoose.Types.ObjectId(data.supervisor);

    const personnel = await Personnel.create(data);

    const accessToken = personnel.generateAccessToken();
    const refreshToken = personnel.generateRefreshToken();

    personnel.refreshToken = refreshToken;
    await personnel.save({ validateBeforeSave: false });

    // Return without password and refreshToken
    const createdPersonnel = await Personnel.findById(personnel._id).select("-password -refreshToken");

    return { personnel: createdPersonnel, accessToken, refreshToken };
};




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




export { signInService, signUpService };
