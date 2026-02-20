import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import {
    createStockRequest as createStockRequestService,
    getMyStockRequests as getMyStockRequestsService,
} from "../services/stock-request.service.js";

const stockRequestSchema = z.object({
    item: z.string().min(1, "Item ID is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    purpose: z.string().min(1, "Purpose is required"),
    remarks: z.string().optional(),
});

const createStockRequest = asyncHandler(async (req, res) => {
    const parsed = stockRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const result = await createStockRequestService(parsed.data, req.user._id, req.user.unit);

    res.status(201).json(
        new ApiResponse(201, result, "Stock request created successfully")
    );
});

const getMyStockRequests = asyncHandler(async (req, res) => {
    const requests = await getMyStockRequestsService(req.user._id, req.user.unit);

    res.status(200).json(
        new ApiResponse(200, requests, "Your stock requests fetched successfully")
    );
});

export { createStockRequest, getMyStockRequests };
