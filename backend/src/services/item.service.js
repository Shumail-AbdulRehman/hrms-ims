import ItemMaster from "../models/itemMaster.model.js";
import { ApiError } from "../utils/ApiError.js";

export const createItemService = async (data, user) => {
    const { name, category, uom, minStockLevel } = data;

    const existingItem = await ItemMaster.findOne({
        name,
        unit: user.unit,
    });

    if (existingItem) {
        throw new ApiError(400, "Item already exists in this unit");
    }

    const item = await ItemMaster.create({
        name,
        category,
        uom,
        minStockLevel,
        unit: user.unit,
    });

    return item;
};
export const getInventoryService = async (user) => {
    const items = await ItemMaster.find({ unit: user.unit }).sort({ name: 1 });

    return items;
};
