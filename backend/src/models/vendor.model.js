import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        contact: String,
        phone: String,
        email: String,
        address: String,
        unit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unit",
            required: true,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Vendor = mongoose.model("Vendor", VendorSchema);

export default Vendor;
