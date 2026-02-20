import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    createItemService,
    getInventoryService,
} from "../services/item.service.js";

export const createItem = asyncHandler(async (req, res) => {
    const item = await createItemService(req.body, req.user);

    return res
        .status(201)
        .json(new ApiResponse(201, item, "Item registered successfully"));
});
export const viewInventory = asyncHandler(async (req, res) => {
    const items = await getInventoryService(req.user);

    return res
        .status(200)
        .json(
            new ApiResponse(200, items, "Inventory data fetched successfully")
        );
});
