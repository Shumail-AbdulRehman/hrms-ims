import mongoose, { Schema } from "mongoose";
import { getNextSequence } from "./counter.model.js";

const StockInSchema = new Schema({
    receiptId: { type: String, unique: true, uppercase: true },
    item: { type: Schema.Types.ObjectId, ref: "ItemMaster", required: true },
    quantity: { type: Number, required: true, min: 1 },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    receivedBy: { type: Schema.Types.ObjectId, ref: "Personnel", required: true },
    remarks: String,
    unit: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
}, { timestamps: true });

StockInSchema.pre("save", async function () {
    if (!this.receiptId) {
        const seq = await getNextSequence("RCV");
        this.receiptId = "RCV-" + String(seq).padStart(5, "0");
    }
});

const StockIn = mongoose.model("StockIn", StockInSchema);
export default StockIn;