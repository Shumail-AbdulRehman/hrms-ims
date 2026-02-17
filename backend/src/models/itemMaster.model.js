import mongoose from "mongoose";

const ItemMasterSchema = new Schema({
    itemId:   { type: String, unique: true, uppercase: true },  
    name:     { type: String, required: true, trim: true },     
    category: { 
        type: String, required: true,
        enum: ["tools", "spare_parts", "consumables", "equipment", "furniture", "stationery"]
    },
    uom:          { type: String, required: true },   
    currentStock: { type: Number, default: 0 },       
    minStockLevel:{ type: Number, default: 0 },       
    unit:    { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    isActive:{ type: Boolean, default: true }
}, { timestamps: true });


ItemMasterSchema.pre("save", async function () {
    if (!this.itemId) {
        const count = await mongoose.model("ItemMaster").countDocuments();
        this.itemId = "ITM-" + String(count + 1).padStart(5, "0");
    }
});


const ItemMaster=mongoose.model("ItemMaster",ItemMasterSchema);

export default ItemMaster;