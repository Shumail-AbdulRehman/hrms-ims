import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import {
    markAttendanceService,
    approveBySubAdminService,
    rejectBySubAdminService,
    approveByAdminService,
    rejectByAdminService,
    getAttendanceService,
} from "../services/attendance.service.js";

// ──── Zod Schemas ────

const markAttendanceSchema = z.object({
    records: z
        .array(
            z.object({
                personnel: z.string().min(1, "Personnel ID is required"),
                date: z.coerce.date(),
                status: z.enum(["present", "absent", "leave", "half_day"]),
                remarks: z.string().optional(),
            })
        )
        .min(1, "At least one attendance record is required"),
});

const approvalSchema = z.object({
    remarks: z.string().optional(),
});

// ──── Controllers ────

/**
 * POST /attendance — Sub Admin marks attendance (bulk)
 */
const markAttendance = asyncHandler(async (req, res) => {
    const parsed = markAttendanceSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const created = await markAttendanceService(parsed.data.records, req.user);

    res.status(201).json(
        new ApiResponse(
            201,
            created,
            `${created.length} attendance record(s) created`
        )
    );
});

/**
 * PATCH /attendance/:id/approve-sub-admin — Sub Admin first-level approval
 */
const approveBySubAdmin = asyncHandler(async (req, res) => {
    const parsed = approvalSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const attendance = await approveBySubAdminService(
        req.params.id,
        req.user,
        parsed.data.remarks
    );

    res.status(200).json(
        new ApiResponse(200, attendance, "Attendance approved by sub_admin")
    );
});

/**
 * PATCH /attendance/:id/reject-sub-admin — Sub Admin rejection
 */
const rejectBySubAdmin = asyncHandler(async (req, res) => {
    const parsed = approvalSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const attendance = await rejectBySubAdminService(
        req.params.id,
        req.user,
        parsed.data.remarks
    );

    res.status(200).json(
        new ApiResponse(200, attendance, "Attendance rejected by sub_admin")
    );
});

/**
 * PATCH /attendance/:id/approve-admin — Admin second-level approval
 */
const approveByAdmin = asyncHandler(async (req, res) => {
    const parsed = approvalSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const attendance = await approveByAdminService(
        req.params.id,
        req.user,
        parsed.data.remarks
    );

    res.status(200).json(
        new ApiResponse(200, attendance, "Attendance approved by admin")
    );
});

/**
 * PATCH /attendance/:id/reject-admin — Admin rejection
 */
const rejectByAdmin = asyncHandler(async (req, res) => {
    const parsed = approvalSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const attendance = await rejectByAdminService(
        req.params.id,
        req.user,
        parsed.data.remarks
    );

    res.status(200).json(
        new ApiResponse(200, attendance, "Attendance rejected by admin")
    );
});

/**
 * GET /attendance — List attendance records (query filters)
 */
const getAttendance = asyncHandler(async (req, res) => {
    const filters = {
        date: req.query.date,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        personnel: req.query.personnel,
        status: req.query.status,
    };

    const attendance = await getAttendanceService(
        req.user.role,
        req.user.unit,
        filters
    );

    res.status(200).json(
        new ApiResponse(200, attendance, "Attendance fetched successfully")
    );
});

export {
    markAttendance,
    approveBySubAdmin,
    rejectBySubAdmin,
    approveByAdmin,
    rejectByAdmin,
    getAttendance,
};
