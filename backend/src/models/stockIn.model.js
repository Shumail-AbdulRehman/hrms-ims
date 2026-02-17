const StockInSchema = new Schema({
    item:     { type: Schema.Types.ObjectId, ref: "ItemMaster", required: true },
    quantity: { type: Number, required: true },         // How many received
    vendor:   { type: Schema.Types.ObjectId, ref: "Vendor" },  // Who supplied it
    receivedBy: { type: Schema.Types.ObjectId, ref: "Personnel", required: true },
    remarks:  String,
    unit:     { type: Schema.Types.ObjectId, ref: "Unit", required: true },
}, { timestamps: true });  


const StockIn=mongoose.model("StockIn",StockInSchema);
export default StockIn;