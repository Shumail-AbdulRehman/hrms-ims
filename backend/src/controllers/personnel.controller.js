import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import { signInService, signUpService } from "../services/personnel.service.js";

const signupSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),

    dateOfBirth: z.coerce.date().optional(),

    gender: z.enum(["male", "female", "other"]).optional(),

    cnic: z.string().optional(),

    phone: z.string().optional(),

    email: z.string().email("Invalid email"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    designation: z.string().optional(),

    department: z.string().optional(),

    unit: z.string().min(1, "Unit is required"),

    employeeType: z.enum(["permanent", "contract"]).default("permanent"),

    joiningDate: z.coerce.date().optional(),

    supervisor: z.string().optional(),

    emergencyContact: z.string().optional(),

    serviceHistory: z
        .array(
            z.object({
                designation: z.string().optional(),

                unit: z.string().optional(),

                startDate: z.coerce.date().optional(),

                endDate: z.coerce.date().optional(),
            })
        )
        .optional(),
});

const signUp = asyncHandler(async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const data = parsed.data;

    const result = await signUpService(data);

    res.status(201).json(
        new ApiResponse(201, result, "Personnel signup successful")
    );
});

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

export { signIn, signUp };
