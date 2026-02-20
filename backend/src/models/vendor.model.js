import mongoose, { Schema } from "mongoose";

const VendorSchema = new Schema({
    name: { type: String, required: true, trim: true },
    contact: String,
    phone: String,
    email: String,
    address: String,
    unit: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Vendor = mongoose.model("Vendor", VendorSchema);

export default Vendor;