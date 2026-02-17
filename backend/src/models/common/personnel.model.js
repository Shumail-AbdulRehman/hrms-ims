import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PersonnelSchema = new Schema({
    employeeId: { type: String, unique: true, uppercase: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    cnic: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, unique: true, trim: true },
    role: {
        type: String,
        enum: [
            "super_admin",
            "admin",
            "hr_officer",
            "supervisor",
            "employee",
            "hrms_audit_officer",
            "store_manager",
           "inventory_operator",
            "ims_audit_officer"
        ],
        required: true,
        default: "employee"
}
,    password: String,
    refreshToken: String,
    emergencyContact: String,
    designation: String,
    department: String,
    unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    employeeType: { type: String, enum: ['permanent', 'contract'], default: 'permanent' },
    joiningDate: Date,
    status: {
        type: String,
        enum: ['active', 'on_leave', 'terminated', 'inactive'],
        default: 'active'
    },
    supervisor: { type: Schema.Types.ObjectId, ref: 'Personnel' },
    serviceHistory: [{
        designation: String,
        unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
        startDate: Date,
        endDate: Date,
    }],
    user: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });


PersonnelSchema.pre('save', async function (next) {
    
    if (!this.employeeId) {
        const count = await mongoose.model('Personnel').countDocuments();
        this.employeeId = 'EMP-' + String(count + 1).padStart(5, '0');
    }

   
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
});


PersonnelSchema.methods.isPasswordCorrect = async function (pass) {
    return await bcrypt.compare(pass, this.password);
};

PersonnelSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            employeeId: this.employeeId,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            designation: this.designation,
            department: this.department,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

PersonnelSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            employeeId: this.employeeId
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

const Personnel = mongoose.model('Personnel', PersonnelSchema);
export default Personnel;
