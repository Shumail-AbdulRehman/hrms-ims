import mongoose, { Schema } from "mongoose";

const ShiftSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        startTime: {
            type: String,
            required: true, // "08:00"
        },
        endTime: {
            type: String,
            required: true, // "16:00"
        },
        assignedTo: [
            {
                type: Schema.Types.ObjectId,
                ref: "Personnel",
            },
        ],
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "Personnel",
            required: true,
        },
        unit: {
            type: Schema.Types.ObjectId,
            ref: "Unit",
            required: true,
        },
        effectiveDate: {
            type: Date,
            required: true,
        },
        remarks: String,

        // ──── Sub Admin Approval ────
        approval: {
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

const Shift = mongoose.model("Shift", ShiftSchema);
export default Shift;
