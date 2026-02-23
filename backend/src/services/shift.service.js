import Shift from "../models/shift.model.js";
import Personnel from "../models/personnel.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Supervisor creates/assigns a shift (pending sub_admin approval)
 */
const createShiftService = async (data, creator) => {
    const unit = creator.unit;

    // Validate all assigned personnel belong to the creator's unit
    if (data.assignedTo && data.assignedTo.length > 0) {
        const personnelInUnit = await Personnel.find({
            _id: { $in: data.assignedTo },
            unit,
            status: "active",
        }).select("_id");

        const validIds = new Set(personnelInUnit.map((p) => String(p._id)));

        for (const id of data.assignedTo) {
            if (!validIds.has(String(id))) {
                throw new ApiError(
                    400,
                    `Personnel ${id} not found in your unit`
                );
            }
        }
    }

    const shift = await Shift.create({
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        assignedTo: data.assignedTo || [],
        assignedBy: creator._id,
        unit,
        effectiveDate: data.effectiveDate,
        remarks: data.remarks || undefined,
        approval: { status: "pending" },
    });

    return shift;
};

/**
 * Update a shift (only if still pending)
 */
const updateShiftService = async (shiftId, data, user) => {
    const shift = await Shift.findById(shiftId);
    if (!shift) throw new ApiError(404, "Shift not found");

    if (String(shift.unit) !== String(user.unit)) {
        throw new ApiError(403, "Shift does not belong to your unit");
    }

    if (shift.approval.status !== "pending") {
        throw new ApiError(400, "Cannot update a shift that has been reviewed");
    }

    // Only the creator or super_admin can update
    if (
        user.role !== "super_admin" &&
        String(shift.assignedBy) !== String(user._id)
    ) {
        throw new ApiError(403, "Only the shift creator can update it");
    }

    if (data.name) shift.name = data.name;
    if (data.startTime) shift.startTime = data.startTime;
    if (data.endTime) shift.endTime = data.endTime;
    if (data.effectiveDate) shift.effectiveDate = data.effectiveDate;
    if (data.remarks !== undefined) shift.remarks = data.remarks;
    if (data.assignedTo) shift.assignedTo = data.assignedTo;

    await shift.save();
    return shift;
};

/**
 * Sub Admin approves a shift
 */
const approveShiftService = async (shiftId, approver, remarks) => {
    const shift = await Shift.findById(shiftId);
    if (!shift) throw new ApiError(404, "Shift not found");

    if (String(shift.unit) !== String(approver.unit)) {
        throw new ApiError(403, "Shift does not belong to your unit");
    }

    if (shift.approval.status !== "pending") {
        throw new ApiError(400, "Shift has already been reviewed");
    }

    shift.approval = {
        status: "approved",
        by: approver._id,
        at: new Date(),
        remarks: remarks || undefined,
    };

    await shift.save();
    return shift;
};

/**
 * Sub Admin rejects a shift
 */
const rejectShiftService = async (shiftId, approver, remarks) => {
    const shift = await Shift.findById(shiftId);
    if (!shift) throw new ApiError(404, "Shift not found");

    if (String(shift.unit) !== String(approver.unit)) {
        throw new ApiError(403, "Shift does not belong to your unit");
    }

    if (shift.approval.status !== "pending") {
        throw new ApiError(400, "Shift has already been reviewed");
    }

    shift.approval = {
        status: "rejected",
        by: approver._id,
        at: new Date(),
        remarks: remarks || undefined,
    };

    await shift.save();
    return shift;
};

/**
 * Get shifts for a unit, with optional filters
 */
const getShiftsService = async (userRole, userUnit, filters = {}) => {
    const query = {};

    if (userRole !== "super_admin") {
        query.unit = userUnit;
    }

    if (filters.status) {
        query["approval.status"] = filters.status;
    }

    const shifts = await Shift.find(query)
        .populate("assignedTo", "employeeId firstName lastName designation")
        .populate("assignedBy", "firstName lastName")
        .populate("approval.by", "firstName lastName")
        .populate("unit", "name code")
        .sort({ createdAt: -1 });

    return shifts;
};

export {
    createShiftService,
    updateShiftService,
    approveShiftService,
    rejectShiftService,
    getShiftsService,
};
