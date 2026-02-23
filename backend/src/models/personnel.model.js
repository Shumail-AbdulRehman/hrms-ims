import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const PersonnelSchema = new Schema(
  {
    employeeId: { type: String, unique: true, uppercase: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    cnic: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, unique: true, trim: true, required: true },
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
        "ims_audit_officer",
      ],
      required: true,
      default: "employee",
    },
    password: { type: String, required: true, select: false },
    refreshToken: String,
    emergencyContact: String,
    designation: String,
    department: String,
    unit: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    employeeType: { type: String, enum: ["permanent", "contract"], default: "permanent" },
    joiningDate: Date,
    status: {
      type: String,
      enum: ["active", "on_leave", "terminated", "inactive"],
      default: "active",
    },
    supervisor: { type: Schema.Types.ObjectId, ref: "Personnel" },
    serviceHistory: [
      {
        designation: String,
        unit: { type: Schema.Types.ObjectId, ref: "Unit" },
        startDate: Date,
        endDate: Date,
      },
    ],
  },
  { timestamps: true }
);

// ✅ Remove duplicate indexes: 'unique: true' already creates indexes
// PersonnelSchema.index({ email: 1 });
// PersonnelSchema.index({ employeeId: 1 });

// Generate unique employeeId and hash password before save
PersonnelSchema.pre("save", async function () {
  if (!this.employeeId) {
    let unique = false;
    while (!unique) {
      const id = "EMP-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();
      const exists = await mongoose.models.Personnel.findOne({ employeeId: id });
      if (!exists) {
        this.employeeId = id;
        unique = true;
      }
    }
  }

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }


});

// Compare password
PersonnelSchema.methods.isPasswordCorrect = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

// Generate JWT access token
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

// Generate JWT refresh token
PersonnelSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      employeeId: this.employeeId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const Personnel = mongoose.model("Personnel", PersonnelSchema);
export default Personnel;
