import ItemMaster from "../models/itemMaster.model.js";
import StockIn from "../models/stockIn.model.js";
import StockOut from "../models/stockOut.model.js";
import StockRequest from "../models/stockRequest.model.js";
import StockReturn from "../models/stockReturn.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const processStockIn = async (data, operatorId, unitId) => {
    const item = await ItemMaster.findById(data.item);
    if (!item) throw new ApiError(404, "Item not found");
    if (String(item.unit) !== String(unitId)) {
        throw new ApiError(403, "Item does not belong to your unit");
    }

    const stockIn = await StockIn.create({
        item: data.item,
        quantity: data.quantity,
        vendor: data.vendor || undefined,
        receivedBy: operatorId,
        remarks: data.remarks,
        unit: unitId,
    });

    item.currentStock += data.quantity;
    await item.save();

    const populated = await StockIn.findById(stockIn._id)
        .populate("item", "itemId name category uom")
        .populate("vendor", "name")
        .populate("receivedBy", "employeeId firstName lastName");

    return populated;
};

const getPendingStockRequests = async (unitId, statusFilter) => {
    const filter = {};
    if (unitId) filter.unit = unitId;
    if (statusFilter) filter.status = statusFilter;

    const requests = await StockRequest.find(filter)
        .populate("item", "itemId name category uom currentStock")
        .populate("requestedBy", "employeeId firstName lastName")
        .populate("reviewedBy", "employeeId firstName lastName")
        .sort({ createdAt: -1 });

    return requests;
};

const approveStockRequest = async (requestId, operatorId, unitId) => {
    const request = await StockRequest.findById(requestId);
    if (!request) throw new ApiError(404, "Stock request not found");
    if (unitId && String(request.unit) !== String(unitId)) {
        throw new ApiError(403, "Request does not belong to your unit");
    }
    if (request.status !== "pending") {
        throw new ApiError(400, `Request already ${request.status}`);
    }

    const item = await ItemMaster.findById(request.item);
    if (!item) throw new ApiError(404, "Item not found");
    if (item.currentStock < request.quantity) {
        throw new ApiError(400, `Insufficient stock. Available: ${item.currentStock}, Requested: ${request.quantity}`);
    }

    request.status = "approved";
    request.reviewedBy = operatorId;
    await request.save();

    await StockOut.create({
        item: request.item,
        quantity: request.quantity,
        purpose: request.purpose,
        issuedTo: request.requestedBy,
        issuedBy: operatorId,
        remarks: `Approved from request ${request.requestId}`,
        unit: unitId,
    });

    item.currentStock -= request.quantity;
    await item.save();

    const populated = await StockRequest.findById(requestId)
        .populate("item", "itemId name category uom currentStock")
        .populate("requestedBy", "employeeId firstName lastName")
        .populate("reviewedBy", "employeeId firstName lastName");

    return populated;
};

const rejectStockRequest = async (requestId, operatorId, unitId, rejectionReason) => {
    const request = await StockRequest.findById(requestId);
    if (!request) throw new ApiError(404, "Stock request not found");
    if (String(request.unit) !== String(unitId)) {
        throw new ApiError(403, "Request does not belong to your unit");
    }
    if (request.status !== "pending") {
        throw new ApiError(400, `Request already ${request.status}`);
    }

    request.status = "rejected";
    request.reviewedBy = operatorId;
    request.rejectionReason = rejectionReason;
    await request.save();

    const populated = await StockRequest.findById(requestId)
        .populate("item", "itemId name category uom")
        .populate("requestedBy", "employeeId firstName lastName")
        .populate("reviewedBy", "employeeId firstName lastName");

    return populated;
};

const processStockReturn = async (data, operatorId, unitId) => {
    const item = await ItemMaster.findById(data.item);
    if (!item) throw new ApiError(404, "Item not found");
    if (String(item.unit) !== String(unitId)) {
        throw new ApiError(403, "Item does not belong to your unit");
    }

    const stockReturn = await StockReturn.create({
        item: data.item,
        quantity: data.quantity,
        returnedBy: data.returnedBy,
        receivedBy: operatorId,
        returnReason: data.returnReason,
        unit: unitId,
        remarks: data.remarks,
    });

    if (data.returnReason === "excess") {
        item.currentStock += data.quantity;
        await item.save();
    }

    const populated = await StockReturn.findById(stockReturn._id)
        .populate("item", "itemId name category uom currentStock")
        .populate("returnedBy", "employeeId firstName lastName")
        .populate("receivedBy", "employeeId firstName lastName");

    return populated;
};

const getInventory = async (unitId) => {
    const filter = { isActive: true };
    if (unitId) filter.unit = unitId;
    const items = await ItemMaster.find(filter)
        .populate("unit", "name code")
        .sort({ name: 1 });
    return items;
};

const getItemById = async (itemId, unitId) => {
    const item = await ItemMaster.findById(itemId).populate("unit", "name code");
    if (!item) throw new ApiError(404, "Item not found");
    if (unitId && String(item.unit._id || item.unit) !== String(unitId)) {
        throw new ApiError(403, "Item does not belong to your unit");
    }
    return item;
};

const getStockHistory = async (unitId, { type, startDate, endDate }) => {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const dateQuery = Object.keys(dateFilter).length > 0
        ? { createdAt: dateFilter }
        : {};

    const result = {};

    if (!type || type === "in") {
        const inFilter = { ...dateQuery };
        if (unitId) inFilter.unit = unitId;
        result.stockIn = await StockIn.find(inFilter)
            .populate("item", "itemId name category")
            .populate("vendor", "name")
            .populate("receivedBy", "employeeId firstName lastName")
            .sort({ createdAt: -1 });
    }

    if (!type || type === "out") {
        const outFilter = { ...dateQuery };
        if (unitId) outFilter.unit = unitId;
        result.stockOut = await StockOut.find(outFilter)
            .populate("item", "itemId name category")
            .populate("issuedTo", "employeeId firstName lastName")
            .populate("issuedBy", "employeeId firstName lastName")
            .sort({ createdAt: -1 });
    }

    if (!type || type === "return") {
        const retFilter = { ...dateQuery };
        if (unitId) retFilter.unit = unitId;
        result.stockReturns = await StockReturn.find(retFilter)
            .populate("item", "itemId name category")
            .populate("returnedBy", "employeeId firstName lastName")
            .populate("receivedBy", "employeeId firstName lastName")
            .sort({ createdAt: -1 });
    }

    return result;
};

export {
    processStockIn,
    getPendingStockRequests,
    approveStockRequest,
    rejectStockRequest,
    processStockReturn,
    getInventory,
    getItemById,
    getStockHistory,
};
