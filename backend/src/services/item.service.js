import ItemMaster from "../models/itemMaster.model.js";
import { ApiError } from "../utils/ApiError.js";

const createItem = async (data, unitId) => {
    const existing = await ItemMaster.findOne({ name: data.name, unit: unitId });
    if (existing) {
        throw new ApiError(400, "Item with this name already exists in this unit");
    }

    const item = await ItemMaster.create({
        name: data.name,
        category: data.category,
        uom: data.uom,
        minStockLevel: data.minStockLevel || 0,
        unit: unitId,
    });

    return ItemMaster.findById(item._id).populate("unit", "name code");
};

const updateItem = async (itemId, data, unitId) => {
    const item = await ItemMaster.findById(itemId);
    if (!item) throw new ApiError(404, "Item not found");
    if (unitId && String(item.unit) !== String(unitId)) {
        throw new ApiError(403, "Item does not belong to your unit");
    }

    if (data.name && data.name !== item.name) {
        const duplicate = await ItemMaster.findOne({ name: data.name, unit: item.unit });
        if (duplicate) throw new ApiError(400, "Another item with this name already exists");
    }

    const allowed = ["name", "category", "uom", "minStockLevel", "isActive"];
    allowed.forEach(field => {
        if (data[field] !== undefined) item[field] = data[field];
    });

    await item.save();
    return ItemMaster.findById(item._id).populate("unit", "name code");
};

const deactivateItem = async (itemId, unitId) => {
    const item = await ItemMaster.findById(itemId);
    if (!item) throw new ApiError(404, "Item not found");
    if (unitId && String(item.unit) !== String(unitId)) {
        throw new ApiError(403, "Item does not belong to your unit");
    }
    item.isActive = false;
    await item.save();
    return ItemMaster.findById(item._id).populate("unit", "name code");
};

const activateItem = async (itemId, unitId) => {
    const item = await ItemMaster.findById(itemId);
    if (!item) throw new ApiError(404, "Item not found");
    if (unitId && String(item.unit) !== String(unitId)) {
        throw new ApiError(403, "Item does not belong to your unit");
    }
    item.isActive = true;
    await item.save();
    return ItemMaster.findById(item._id).populate("unit", "name code");
};

export { createItem, updateItem, deactivateItem, activateItem };
