import Attendance from "../models/attendance.model.js";
import Personnel from "../models/personnel.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Sub Admin marks attendance for personnel in their unit
 * @param {Array} records - [{ personnel, date, status, remarks? }]
 * @param {Object} marker - req.user (the sub_admin)
 */
const markAttendanceService = async (records, marker) => {
    const unit = marker.unit;

    // Validate all personnel belong to the marker's unit
    const personnelIds = records.map((r) => r.personnel);
    const personnelInUnit = await Personnel.find({
        _id: { $in: personnelIds },
        unit,
        status: "active",
    }).select("_id");

    const validIds = new Set(personnelInUnit.map((p) => String(p._id)));

    for (const id of personnelIds) {
        if (!validIds.has(String(id))) {
            throw new ApiError(400, `Personnel ${id} not found in your unit`);
        }
    }

    const attendanceDocs = records.map((r) => ({
        personnel: r.personnel,
        date: r.date,
        status: r.status,
        remarks: r.remarks || undefined,
        markedBy: marker._id,
        unit,
        subAdminApproval: { status: "pending" },
        adminApproval: { status: "pending" },
    }));

    // insertMany with ordered:false to continue on duplicates
    try {
        const created = await Attendance.insertMany(attendanceDocs, {
            ordered: false,
        });
        return created;
    } catch (err) {
        if (err.code === 11000) {
            throw new ApiError(
                400,
                "Duplicate attendance entries found — some personnel already have attendance for the given date(s)"
            );
        }
        throw err;
    }
};

/**
 * Sub Admin approves attendance (first-level approval)
 */
const approveBySubAdminService = async (attendanceId, approver, remarks) => {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) throw new ApiError(404, "Attendance record not found");

    if (String(attendance.unit) !== String(approver.unit)) {
        throw new ApiError(403, "Attendance does not belong to your unit");
    }

    if (attendance.subAdminApproval.status !== "pending") {
        throw new ApiError(400, "Attendance already reviewed by sub_admin");
    }

    attendance.subAdminApproval = {
        status: "approved",
        by: approver._id,
        at: new Date(),
        remarks: remarks || undefined,
    };

    await attendance.save();
    return attendance;
};

/**
 * Sub Admin rejects attendance
 */
const rejectBySubAdminService = async (attendanceId, approver, remarks) => {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) throw new ApiError(404, "Attendance record not found");

    if (String(attendance.unit) !== String(approver.unit)) {
        throw new ApiError(403, "Attendance does not belong to your unit");
    }

    if (attendance.subAdminApproval.status !== "pending") {
        throw new ApiError(400, "Attendance already reviewed by sub_admin");
    }

    attendance.subAdminApproval = {
        status: "rejected",
        by: approver._id,
        at: new Date(),
        remarks: remarks || undefined,
    };

    await attendance.save();
    return attendance;
};

/**
 * Admin approves attendance (second-level, only after sub_admin approved)
 */
const approveByAdminService = async (attendanceId, approver, remarks) => {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) throw new ApiError(404, "Attendance record not found");

    if (String(attendance.unit) !== String(approver.unit)) {
        throw new ApiError(403, "Attendance does not belong to your unit");
    }

    if (attendance.subAdminApproval.status !== "approved") {
        throw new ApiError(
            400,
            "Attendance must be approved by sub_admin first"
        );
    }

    if (attendance.adminApproval.status !== "pending") {
        throw new ApiError(400, "Attendance already reviewed by admin");
    }

    attendance.adminApproval = {
        status: "approved",
        by: approver._id,
        at: new Date(),
        remarks: remarks || undefined,
    };

    await attendance.save();
    return attendance;
};

/**
 * Admin rejects attendance (second-level)
 */
const rejectByAdminService = async (attendanceId, approver, remarks) => {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) throw new ApiError(404, "Attendance record not found");

    if (String(attendance.unit) !== String(approver.unit)) {
        throw new ApiError(403, "Attendance does not belong to your unit");
    }

    if (attendance.subAdminApproval.status !== "approved") {
        throw new ApiError(
            400,
            "Attendance must be approved by sub_admin first before admin can review"
        );
    }

    if (attendance.adminApproval.status !== "pending") {
        throw new ApiError(400, "Attendance already reviewed by admin");
    }

    attendance.adminApproval = {
        status: "rejected",
        by: approver._id,
        at: new Date(),
        remarks: remarks || undefined,
    };

    await attendance.save();
    return attendance;
};

/**
 * Get attendance records for a unit, with optional filters
 */
const getAttendanceService = async (userRole, userUnit, filters = {}) => {
    const query = {};

    if (userRole !== "super_admin") {
        query.unit = userUnit;
    }

    if (filters.date) {
        query.date = new Date(filters.date);
    }

    if (filters.startDate && filters.endDate) {
        query.date = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate),
        };
    }

    if (filters.personnel) {
        query.personnel = filters.personnel;
    }

    if (filters.status) {
        query.status = filters.status;
    }

    const attendance = await Attendance.find(query)
        .populate("personnel", "employeeId firstName lastName designation role")
        .populate("markedBy", "firstName lastName")
        .populate("subAdminApproval.by", "firstName lastName")
        .populate("adminApproval.by", "firstName lastName")
        .populate("unit", "name code")
        .sort({ date: -1 });

    return attendance;
};

export {
    markAttendanceService,
    approveBySubAdminService,
    rejectBySubAdminService,
    approveByAdminService,
    rejectByAdminService,
    getAttendanceService,
};
