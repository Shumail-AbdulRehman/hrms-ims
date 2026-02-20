import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import {
    createVendor as createVendorService,
    updateVendor as updateVendorService,
    deactivateVendor as deactivateVendorService,
    activateVendor as activateVendorService,
    getVendors as getVendorsService,
    getVendorById as getVendorByIdService,
} from "../services/vendor.service.js";

const createVendorSchema = z.object({
    name: z.string().min(1, "Vendor name is required"),
    contact: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    address: z.string().optional(),
    unit: z.string().optional(),
});

const updateVendorSchema = z.object({
    name: z.string().min(1).optional(),
    contact: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    address: z.string().optional(),
});

const resolveUnit = (req, bodyUnit) => {
    if (req.user.role === "super_admin") {
        if (!bodyUnit) throw new ApiError(400, "Super Admin must specify a unit");
        return bodyUnit;
    }
    return req.user.unit;
};

const createVendor = asyncHandler(async (req, res) => {
    const parsed = createVendorSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const unitId = resolveUnit(req, parsed.data.unit);
    const vendor = await createVendorService(parsed.data, unitId);

    res.status(201).json(
        new ApiResponse(201, vendor, "Vendor created successfully")
    );
});

const updateVendor = asyncHandler(async (req, res) => {
    const parsed = updateVendorSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const unitId = req.user.role === "super_admin" ? null : req.user.unit;
    const vendor = await updateVendorService(req.params.id, parsed.data, unitId);

    res.status(200).json(
        new ApiResponse(200, vendor, "Vendor updated successfully")
    );
});

const deactivateVendor = asyncHandler(async (req, res) => {
    const unitId = req.user.role === "super_admin" ? null : req.user.unit;
    const vendor = await deactivateVendorService(req.params.id, unitId);

    res.status(200).json(
        new ApiResponse(200, vendor, "Vendor deactivated successfully")
    );
});

const activateVendor = asyncHandler(async (req, res) => {
    const unitId = req.user.role === "super_admin" ? null : req.user.unit;
    const vendor = await activateVendorService(req.params.id, unitId);

    res.status(200).json(
        new ApiResponse(200, vendor, "Vendor activated successfully")
    );
});

const getVendors = asyncHandler(async (req, res) => {
    const showInactive = req.query.showInactive === "true";
    const unitId = req.user.role === "super_admin" ? null : req.user.unit;
    const vendors = await getVendorsService(unitId, showInactive);

    res.status(200).json(
        new ApiResponse(200, vendors, "Vendors fetched successfully")
    );
});

const getVendorById = asyncHandler(async (req, res) => {
    const unitId = req.user.role === "super_admin" ? null : req.user.unit;
    const vendor = await getVendorByIdService(req.params.id, unitId);

    res.status(200).json(
        new ApiResponse(200, vendor, "Vendor fetched successfully")
    );
});

export {
    createVendor,
    updateVendor,
    deactivateVendor,
    activateVendor,
    getVendors,
    getVendorById,
};
