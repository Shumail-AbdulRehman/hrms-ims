import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import { createItem, updateItem, deactivateItem, activateItem } from "../services/item.service.js";

const CATEGORIES = ["tools", "spare_parts", "consumables", "equipment", "furniture", "stationery"];

const createItemSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    category: z.enum(CATEGORIES, { message: "Invalid category" }),
    uom: z.string().min(1, "Unit of measure is required"),
    minStockLevel: z.number().int().min(0).optional(),
    unit: z.string().optional(),
});

const createItemCtrl = asyncHandler(async (req, res) => {
    const parsed = createItemSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    let unitId;
    if (req.user.role === "super_admin") {
        if (!parsed.data.unit) throw new ApiError(400, "Super Admin must specify a unit");
        unitId = parsed.data.unit;
    } else {
        unitId = req.user.unit;
    }

    const item = await createItem(parsed.data, unitId);
    res.status(201).json(new ApiResponse(201, item, "Item registered successfully"));
});

const updateItemSchema = z.object({
    name: z.string().min(1).optional(),
    category: z.enum(CATEGORIES).optional(),
    uom: z.string().min(1).optional(),
    minStockLevel: z.number().int().min(0).optional(),
});

const updateItemCtrl = asyncHandler(async (req, res) => {
    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const unitId = req.user.role === "super_admin" ? null : req.user.unit;
    const item = await updateItem(req.params.id, parsed.data, unitId);
    res.status(200).json(new ApiResponse(200, item, "Item updated successfully"));
});

const deactivateItemCtrl = asyncHandler(async (req, res) => {
    const unitId = req.user.role === "super_admin" ? null : req.user.unit;
    const item = await deactivateItem(req.params.id, unitId);
    res.status(200).json(new ApiResponse(200, item, "Item deactivated"));
});

const activateItemCtrl = asyncHandler(async (req, res) => {
    const unitId = req.user.role === "super_admin" ? null : req.user.unit;
    const item = await activateItem(req.params.id, unitId);
    res.status(200).json(new ApiResponse(200, item, "Item activated"));
});

export { createItemCtrl, updateItemCtrl, deactivateItemCtrl, activateItemCtrl };
