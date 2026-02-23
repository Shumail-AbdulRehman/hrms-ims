import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import {
    createShiftService,
    updateShiftService,
    approveShiftService,
    rejectShiftService,
    getShiftsService,
} from "../services/shift.service.js";

// ──── Zod Schemas ────

const createShiftSchema = z.object({
    name: z.string().min(1, "Shift name is required"),
    startTime: z.string().min(1, "Start time is required"),  // "08:00"
    endTime: z.string().min(1, "End time is required"),      // "16:00"
    assignedTo: z.array(z.string()).optional(),
    effectiveDate: z.coerce.date(),
    remarks: z.string().optional(),
});

const updateShiftSchema = z.object({
    name: z.string().min(1).optional(),
    startTime: z.string().min(1).optional(),
    endTime: z.string().min(1).optional(),
    assignedTo: z.array(z.string()).optional(),
    effectiveDate: z.coerce.date().optional(),
    remarks: z.string().optional(),
});

const approvalSchema = z.object({
    remarks: z.string().optional(),
});

// ──── Controllers ────

/**
 * POST /shifts — Supervisor creates a shift
 */
const createShift = asyncHandler(async (req, res) => {
    const parsed = createShiftSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const shift = await createShiftService(parsed.data, req.user);

    res.status(201).json(
        new ApiResponse(201, shift, "Shift created — pending sub_admin approval")
    );
});

/**
 * PUT /shifts/:id — Supervisor updates a pending shift
 */
const updateShift = asyncHandler(async (req, res) => {
    const parsed = updateShiftSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const shift = await updateShiftService(req.params.id, parsed.data, req.user);

    res.status(200).json(
        new ApiResponse(200, shift, "Shift updated successfully")
    );
});

/**
 * PATCH /shifts/:id/approve — Sub Admin approves
 */
const approveShift = asyncHandler(async (req, res) => {
    const parsed = approvalSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const shift = await approveShiftService(
        req.params.id,
        req.user,
        parsed.data.remarks
    );

    res.status(200).json(
        new ApiResponse(200, shift, "Shift approved")
    );
});

/**
 * PATCH /shifts/:id/reject — Sub Admin rejects
 */
const rejectShift = asyncHandler(async (req, res) => {
    const parsed = approvalSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const shift = await rejectShiftService(
        req.params.id,
        req.user,
        parsed.data.remarks
    );

    res.status(200).json(
        new ApiResponse(200, shift, "Shift rejected")
    );
});

/**
 * GET /shifts — List shifts (filtered by unit, optional status filter)
 */
const getShifts = asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status, // "pending" | "approved" | "rejected"
    };

    const shifts = await getShiftsService(req.user.role, req.user.unit, filters);

    res.status(200).json(
        new ApiResponse(200, shifts, "Shifts fetched successfully")
    );
});

export {
    createShift,
    updateShift,
    approveShift,
    rejectShift,
    getShifts,
};
