import mongoose,{Schema} from "mongoose";


const PersonnelSchema = new Schema({
    employeeId: { type: String, unique: true, uppercase: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    cnic: String,
    phone: String,
    email: String,
    emergencyContact:String,
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



PersonnelSchema.pre('save', async function () {
    if (!this.employeeId) {
        const count = await mongoose.model('Personnel').countDocuments();
        this.employeeId = 'EMP-' + String(count + 1).padStart(5, '0');
    }
});


export default Personnel= mongoose.model('Personnel', PersonnelSchema);