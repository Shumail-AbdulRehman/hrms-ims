import mongoose, { Schema } from "mongoose";

const UnitSchema = new Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, uppercase: true },
    location: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Unit = mongoose.model("Unit", UnitSchema);

export default Unit;