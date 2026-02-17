// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// // ============================================
// // IMS SCHEMAS
// // ============================================

// /**
//  * Item Master Schema
//  * Store Manager registers items. Unit-scoped.
//  */
// const ItemMasterSchema = new Schema({
//     itemId: { type: String, unique: true, uppercase: true },
//     name: { type: String, required: true, trim: true },
//     description: String,
//     category: {
//         type: String,
//         required: true,
//         enum: ['tools', 'spare_parts', 'consumables', 'equipment']
//     },
//     subCategory: String,
//     uom: { type: String, required: true },
//     minStockLevel: { type: Number, default: 0 },
//     maxStockLevel: Number,
//     reorderPoint: Number,
//     currentStock: { type: Number, default: 0 },
//     unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
//     isActive: { type: Boolean, default: true }
// }, { timestamps: true });

// // Auto-generate itemId before save
// ItemMasterSchema.pre('save', async function () {
//     if (!this.itemId) {
//         const count = await mongoose.model('ItemMaster').countDocuments();
//         this.itemId = 'ITM-' + String(count + 1).padStart(5, '0');
//     }
// });

// /**
//  * Stock In Schema (Goods Receipt)
//  * Inventory Operator processes — no approval needed
//  */
// const StockInSchema = new Schema({
//     item: { type: Schema.Types.ObjectId, ref: 'ItemMaster', required: true },
//     quantityReceived: { type: Number, required: true },
//     unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
//     receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' },
//     remarks: String,
//     dateTime: { type: Date, default: Date.now }
// }, { timestamps: true });

// /**
//  * Stock Out Schema (Item Issue)
//  * Employee requests → Inventory Operator approves
//  */
// const StockOutSchema = new Schema({
//     item: { type: Schema.Types.ObjectId, ref: 'ItemMaster', required: true },
//     quantityIssued: { type: Number, required: true },
//     purposeOfIssue: { type: String, required: true },
//     unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
//     requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
//     status: {
//         type: String,
//         enum: ['pending', 'approved', 'rejected', 'completed'],
//         default: 'pending'
//     },
//     remarks: String,
//     dateTime: { type: Date, default: Date.now }
// }, { timestamps: true });

// /**
//  * Stock Return Schema
//  * Inventory Operator processes — no approval needed
//  */
// const StockReturnSchema = new Schema({
//     item: { type: Schema.Types.ObjectId, ref: 'ItemMaster', required: true },
//     quantityReturned: { type: Number, required: true },
//     returnedBy: { type: Schema.Types.ObjectId, ref: 'Personnel' },
//     unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
//     returnReason: {
//         type: String,
//         enum: ['damaged', 'expired', 'excess', 'defective', 'other'],
//         required: true
//     },
//     receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     remarks: String,
//     dateTime: { type: Date, default: Date.now }
// }, { timestamps: true });

// /**
//  * Vendor Schema - Basic info only
//  * Store Manager manages vendors (name, contact, number)
//  */
// const VendorSchema = new Schema({
//     vendorName: { type: String, required: true, trim: true },
//     contactPerson: String,
//     phoneNumber: String,
//     email: String,
//     address: String,
//     unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
//     isActive: { type: Boolean, default: true }
// }, { timestamps: true });

// /**
//  * Procurement Schema - Purchase requests
//  * Store Manager creates request → Admin approves (single-level)
//  */
// const ProcurementSchema = new Schema({
//     items: [{
//         item: { type: Schema.Types.ObjectId, ref: 'ItemMaster', required: true },
//         requestedQuantity: { type: Number, required: true },
//         estimatedPrice: Number
//     }],
//     unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
//     requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     justification: String,
//     status: {
//         type: String,
//         enum: ['pending', 'approved', 'rejected', 'completed'],
//         default: 'pending'
//     },
//     approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
//     approvalDate: Date,
//     approvalRemarks: String
// }, { timestamps: true });

// // ============================================
// // EXPORT IMS MODELS
// // ============================================
// module.exports = {
//     ItemMaster: mongoose.model('ItemMaster', ItemMasterSchema),
//     StockIn: mongoose.model('StockIn', StockInSchema),
//     StockOut: mongoose.model('StockOut', StockOutSchema),
//     StockReturn: mongoose.model('StockReturn', StockReturnSchema),
//     Vendor: mongoose.model('Vendor', VendorSchema),
//     Procurement: mongoose.model('Procurement', ProcurementSchema)
// };