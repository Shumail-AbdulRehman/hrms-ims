import mongoose, { Schema } from "mongoose";
import { getNextSequence } from "./counter.model.js";

const ItemMasterSchema = new Schema({
    itemId: { type: String, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    category: {
        type: String, required: true,
        enum: ["tools", "spare_parts", "consumables", "equipment", "furniture", "stationery"]
    },
    uom: { type: String, required: true },
    currentStock: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 0 },
    unit: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });


ItemMasterSchema.pre("save", async function () {
    if (!this.itemId) {
        const seq = await getNextSequence("ITM");
        this.itemId = "ITM-" + String(seq).padStart(5, "0");
    }
});


const ItemMaster = mongoose.model("ItemMaster", ItemMasterSchema);

export default ItemMaster;