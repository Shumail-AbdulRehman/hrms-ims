import mongoose, { Schema } from "mongoose";

const StockOutSchema = new Schema({
    item: { type: Schema.Types.ObjectId, ref: "ItemMaster", required: true },
    quantity: { type: Number, required: true },
    purpose: { type: String, required: true },
    issuedTo: { type: Schema.Types.ObjectId, ref: "Personnel", required: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: "Personnel", required: true },
    remarks: String,
    unit: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
}, { timestamps: true });


const StockOut = mongoose.model("StockOut", StockOutSchema);

export default StockOut;
