import Unit from "../models/unit.model.js";
import { ApiError } from "../utils/ApiError.js";

const createUnit = async (data) => {
    if (data.code) {
        const existing = await Unit.findOne({ code: data.code.toUpperCase() });
        if (existing) {
            throw new ApiError(400, "Unit code already exists");
        }
    }

    const unit = await Unit.create({
        name: data.name,
        code: data.code,
        location: data.location,
    });

    return unit;
};

const updateUnit = async (unitId, data) => {
    const unit = await Unit.findById(unitId);
    if (!unit) throw new ApiError(404, "Unit not found");

    if (data.code && data.code.toUpperCase() !== unit.code) {
        const duplicate = await Unit.findOne({ code: data.code.toUpperCase() });
        if (duplicate) {
            throw new ApiError(400, "Unit code already exists");
        }
    }

    Object.assign(unit, data);
    await unit.save();

    return unit;
};

const deactivateUnit = async (unitId) => {
    const unit = await Unit.findById(unitId);
    if (!unit) throw new ApiError(404, "Unit not found");

    unit.isActive = false;
    await unit.save();

    return unit;
};

const activateUnit = async (unitId) => {
    const unit = await Unit.findById(unitId);
    if (!unit) throw new ApiError(404, "Unit not found");

    unit.isActive = true;
    await unit.save();

    return unit;
};

const getUnits = async (showInactive) => {
    const filter = {};
    if (!showInactive) filter.isActive = true;

    const units = await Unit.find(filter).sort({ name: 1 });
    return units;
};

const getUnitById = async (unitId) => {
    const unit = await Unit.findById(unitId);
    if (!unit) throw new ApiError(404, "Unit not found");
    return unit;
};

export {
    createUnit,
    updateUnit,
    deactivateUnit,
    activateUnit,
    getUnits,
    getUnitById,
};
