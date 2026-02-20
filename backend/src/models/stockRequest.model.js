import mongoose, { Schema } from "mongoose";
import { getNextSequence } from "./counter.model.js";

const StockRequestSchema = new Schema({
    requestId: { type: String, unique: true, uppercase: true },
    item: { type: Schema.Types.ObjectId, ref: "ItemMaster", required: true },
    quantity: { type: Number, required: true, min: 1 },
    purpose: { type: String, required: true, trim: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "Personnel", required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Personnel" }, 
    rejectionReason: String,
    unit: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    remarks: String
}, { timestamps: true });

StockRequestSchema.pre("save", async function () {
    if (!this.requestId) {
        const seq = await getNextSequence("REQ");
        this.requestId = "REQ-" + String(seq).padStart(5, "0");
    }
});

const StockRequest = mongoose.model("StockRequest", StockRequestSchema);
export default StockRequest;
