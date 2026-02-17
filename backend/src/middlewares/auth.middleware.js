
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import Personnel from "../models/common/personnel.model.js";
import {ApiError} from "../utils/ApiError.js"



export const verifyJwt = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized access");
    }
    let decodedInfo;
    try {
        decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token");
    }
    const user = await Personnel.findById(decodedInfo?._id).select(
        "-password -refreshToken"
    );

   
    if (!user || user.status !== 'active') {
    throw new ApiError(401, "invalid or inactive user");
}

    req.user = user;
    next();
});