
import mongoose,{Schema} from "mongoose";

const ItemMasterSchema = new Schema({

    unitId: { type: String, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: String,
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
    maxStockLevel: Number,
    reorderPoint: Number,
    currentStock: { type: Number, default: 0 },
    unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });


UnitSchema.pre('save', async function () {
    if (!this.unitId) {
        const count = await mongoose.model('Unit').countDocuments();
        this.unitId = 'UNIT-' + String(count + 1).padStart(5, '0');
    }
});



 export default ItemMaster=mongoose.model('ItemMaster', ItemMasterSchema)


