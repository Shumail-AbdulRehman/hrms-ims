import mongoose, { Schema } from "mongoose";

const AttendanceSchema = new Schema(
    {
        personnel: {
            type: Schema.Types.ObjectId,
            ref: "Personnel",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["present", "absent", "leave", "half_day"],
            required: true,
        },
        markedBy: {
            type: Schema.Types.ObjectId,
            ref: "Personnel",
            required: true,
        },
        unit: {
            type: Schema.Types.ObjectId,
            ref: "Unit",
            required: true,
        },
        remarks: String,

        // ──── Two-Level Approval ────
        subAdminApproval: {
            status: {
                type: String,
                enum: ["pending", "approved", "rejected"],
                default: "pending",
            },
            by: { type: Schema.Types.ObjectId, ref: "Personnel" },
            at: Date,
            remarks: String,
        },
        adminApproval: {
            status: {
                type: String,
                enum: ["pending", "approved", "rejected"],
                default: "pending",
            },
            by: { type: Schema.Types.ObjectId, ref: "Personnel" },
            at: Date,
            remarks: String,
        },
    },
    { timestamps: true }
);

// Prevent duplicate attendance for same person on same date
AttendanceSchema.index({ personnel: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
