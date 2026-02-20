import StockRequest from "../models/stockRequest.model.js";
import ItemMaster from "../models/itemMaster.model.js";
import { ApiError } from "../utils/ApiError.js";

const createStockRequest = async (data, employeeId, unitId) => {
    const item = await ItemMaster.findById(data.item);
    if (!item) throw new ApiError(404, "Item not found");
    if (String(item.unit) !== String(unitId)) {
        throw new ApiError(403, "Item does not belong to your unit");
    }
    if (!item.isActive) {
        throw new ApiError(400, "Item is not active");
    }

    const request = await StockRequest.create({
        item: data.item,
        quantity: data.quantity,
        purpose: data.purpose,
        requestedBy: employeeId,
        unit: unitId,
        remarks: data.remarks,
    });

    const populated = await StockRequest.findById(request._id)
        .populate("item", "itemId name category uom currentStock")
        .populate("requestedBy", "employeeId firstName lastName");

    return populated;
};

const getMyStockRequests = async (employeeId, unitId) => {
    const requests = await StockRequest.find({
        requestedBy: employeeId,
        unit: unitId,
    })
        .populate("item", "itemId name category uom currentStock")
        .populate("reviewedBy", "employeeId firstName lastName")
        .sort({ createdAt: -1 });

    return requests;
};

export { createStockRequest, getMyStockRequests };
