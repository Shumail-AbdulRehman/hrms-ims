import mongoose, { Schema } from "mongoose";
import { getNextSequence } from "./counter.model.js";

const StockReturnSchema = new Schema({
    returnId: { type: String, unique: true, uppercase: true },
    item: { type: Schema.Types.ObjectId, ref: "ItemMaster", required: true },
    quantity: { type: Number, required: true, min: 1 },
    returnedBy: { type: Schema.Types.ObjectId, ref: "Personnel", required: true },
    receivedBy: { type: Schema.Types.ObjectId, ref: "Personnel", required: true },
    returnReason: {
        type: String,
        enum: ["damaged", "excess"],
        required: true
    },
    unit: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    remarks: String
}, { timestamps: true });

StockReturnSchema.pre("save", async function () {
    if (!this.returnId) {
        const seq = await getNextSequence("RET");
        this.returnId = "RET-" + String(seq).padStart(5, "0");
    }
});

const StockReturn = mongoose.model("StockReturn", StockReturnSchema);
export default StockReturn;
