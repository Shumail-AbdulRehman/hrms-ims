import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import {
    createUnit as createUnitService,
    updateUnit as updateUnitService,
    deactivateUnit as deactivateUnitService,
    activateUnit as activateUnitService,
    getUnits as getUnitsService,
    getUnitById as getUnitByIdService,
} from "../services/unit.service.js";

const createUnitSchema = z.object({
    name: z.string().min(1, "Unit name is required"),
    code: z.string().min(1, "Unit code is required"),
    location: z.string().optional(),
});

const updateUnitSchema = z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    location: z.string().optional(),
});

const createUnit = asyncHandler(async (req, res) => {
    const parsed = createUnitSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const unit = await createUnitService(parsed.data);

    res.status(201).json(
        new ApiResponse(201, unit, "Unit created successfully")
    );
});

const updateUnit = asyncHandler(async (req, res) => {
    const parsed = updateUnitSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.errors[0].message);
    }

    const unit = await updateUnitService(req.params.id, parsed.data);

    res.status(200).json(
        new ApiResponse(200, unit, "Unit updated successfully")
    );
});

const deactivateUnit = asyncHandler(async (req, res) => {
    const unit = await deactivateUnitService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, unit, "Unit deactivated successfully")
    );
});

const activateUnit = asyncHandler(async (req, res) => {
    const unit = await activateUnitService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, unit, "Unit activated successfully")
    );
});

const getUnits = asyncHandler(async (req, res) => {
    const showInactive = req.query.showInactive === "true";
    const units = await getUnitsService(showInactive);

    res.status(200).json(
        new ApiResponse(200, units, "Units fetched successfully")
    );
});

const getUnitById = asyncHandler(async (req, res) => {
    const unit = await getUnitByIdService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, unit, "Unit fetched successfully")
    );
});

export {
    createUnit,
    updateUnit,
    deactivateUnit,
    activateUnit,
    getUnits,
    getUnitById,
};
