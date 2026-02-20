import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import {
    processStockIn as processStockInService,
    getPendingStockRequests as getPendingStockRequestsService,
    approveStockRequest as approveStockRequestService,
    rejectStockRequest as rejectStockRequestService,
    processStockReturn as processStockReturnService,
    getInventory as getInventoryService,
    getItemById as getItemByIdService,
    getStockHistory as getStockHistoryService,
} from "../services/inventory-operator.service.js";

const stockInSchema = z.object({
    item: z.string().min(1, "Item ID is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    vendor: z.string().optional(),
    remarks: z.string().optional(),
});

const stockReturnSchema = z.object({
    item: z.string().min(1, "Item ID is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    returnedBy: z.string().min(1, "ReturnedBy is required"),
    returnReason: z.enum(["damaged", "excess"], {
        message: "Return reason must be 'damaged' or 'excess'",
    }),
    remarks: z.string().optional(),
});

const rejectSchema = z.object({
    rejectionReason: z.string().min(1, "Rejection reason is required"),
});

const stockHistoryQuerySchema = z.object({
    type: z.enum(["in", "out", "return"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

const resolveUnit = (req) => req.user.role === "super_admin" ? null : req.user.unit;

const processStockIn = asyncHandler(async (req, res) => {
    const parsed = stockInSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const unitId = resolveUnit(req);
    const result = await processStockInService(parsed.data, req.user._id, unitId || req.user.unit);

    res.status(201).json(
        new ApiResponse(201, result, "Stock received successfully")
    );
});

const getStockRequests = asyncHandler(async (req, res) => {
    const statusFilter = req.query.status || null;
    const requests = await getPendingStockRequestsService(resolveUnit(req), statusFilter);

    res.status(200).json(
        new ApiResponse(200, requests, "Stock requests fetched successfully")
    );
});

const approveStockOut = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await approveStockRequestService(id, req.user._id, resolveUnit(req) || req.user.unit);

    res.status(200).json(
        new ApiResponse(200, result, "Stock request approved successfully")
    );
});

const rejectStockOut = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const result = await rejectStockRequestService(
        id, req.user._id, resolveUnit(req) || req.user.unit, parsed.data.rejectionReason
    );

    res.status(200).json(
        new ApiResponse(200, result, "Stock request rejected")
    );
});

const processStockReturn = asyncHandler(async (req, res) => {
    const parsed = stockReturnSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const result = await processStockReturnService(parsed.data, req.user._id, resolveUnit(req) || req.user.unit);

    res.status(201).json(
        new ApiResponse(201, result, "Stock return processed successfully")
    );
});

const getInventory = asyncHandler(async (req, res) => {
    const items = await getInventoryService(resolveUnit(req));

    res.status(200).json(
        new ApiResponse(200, items, "Inventory fetched successfully")
    );
});

const getItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await getItemByIdService(id, resolveUnit(req));

    res.status(200).json(
        new ApiResponse(200, item, "Item fetched successfully")
    );
});

const getStockHistory = asyncHandler(async (req, res) => {
    const parsed = stockHistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const history = await getStockHistoryService(resolveUnit(req), parsed.data);

    res.status(200).json(
        new ApiResponse(200, history, "Stock history fetched successfully")
    );
});

export {
    processStockIn,
    getStockRequests,
    approveStockOut,
    rejectStockOut,
    processStockReturn,
    getInventory,
    getItemById,
    getStockHistory,
};
