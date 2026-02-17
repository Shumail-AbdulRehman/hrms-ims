import mongoose, { Schema } from "mongoose";

const ItemMasterSchema = new Schema({
    unitId: { type: String, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
        type: String,
        required: true,
        enum: ['tools', 'spare_parts', 'consumables', 'equipment']
    },
    uom: {
        type: String,
        required: true,
        enum: ['pcs', 'kg', 'liters', 'meters', 'boxes'] 
    },
    minStockLevel: { type: Number, default: 0 },
    maxStockLevel: { type: Number, default: 0 },
    reorderPoint: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });


ItemMasterSchema.pre('save', async function (next) {
    if (!this.unitId) {
        const count = await mongoose.model('ItemMaster').countDocuments();
        this.unitId = 'UNIT-' + String(count + 1).padStart(5, '0');
    }
    next();
});

const ItemMaster = mongoose.model('ItemMaster', ItemMasterSchema);
export default ItemMaster;
