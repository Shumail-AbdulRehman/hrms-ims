import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";

import { signInService, signUpService } from "../services/personnel.service.js";

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

const signUp = asyncHandler((req, res, next) => {});

export { signIn, signUp };
