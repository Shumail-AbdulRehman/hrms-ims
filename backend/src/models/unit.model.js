import mongoose, { Schema } from "mongoose";

const UnitSchema = new Schema({
    name: { type: String, required: true, trim: true },    // "Lahore Office"
    code: { type: String, unique: true, uppercase: true },  // "LHR-01"
    location: String,                                        // "Lahore"
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Unit= mongoose.model("Unit", UnitSchema);

export default Unit;