import Vendor from "../models/vendor.model.js";
import { ApiError } from "../utils/ApiError.js";

const createVendor = async (data, unitId) => {
    const existing = await Vendor.findOne({ name: data.name, unit: unitId });
    if (existing) {
        throw new ApiError(400, "Vendor with this name already exists in this unit");
    }

    const vendor = await Vendor.create({
        name: data.name,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        address: data.address,
        unit: unitId,
    });

    return Vendor.findById(vendor._id).populate("unit", "name code");
};

const updateVendor = async (vendorId, data, unitId) => {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");
    if (unitId && String(vendor.unit) !== String(unitId)) {
        throw new ApiError(403, "Vendor does not belong to your unit");
    }

    if (data.name && data.name !== vendor.name) {
        const duplicate = await Vendor.findOne({ name: data.name, unit: vendor.unit });
        if (duplicate) {
            throw new ApiError(400, "Another vendor with this name already exists");
        }
    }

    Object.assign(vendor, data);
    await vendor.save();

    return Vendor.findById(vendor._id).populate("unit", "name code");
};

const deactivateVendor = async (vendorId, unitId) => {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");
    if (unitId && String(vendor.unit) !== String(unitId)) {
        throw new ApiError(403, "Vendor does not belong to your unit");
    }

    vendor.isActive = false;
    await vendor.save();

    return Vendor.findById(vendor._id).populate("unit", "name code");
};

const activateVendor = async (vendorId, unitId) => {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");
    if (unitId && String(vendor.unit) !== String(unitId)) {
        throw new ApiError(403, "Vendor does not belong to your unit");
    }

    vendor.isActive = true;
    await vendor.save();

    return Vendor.findById(vendor._id).populate("unit", "name code");
};

const getVendors = async (unitId, showInactive) => {
    const filter = {};
    if (unitId) filter.unit = unitId;
    if (!showInactive) filter.isActive = true;

    const vendors = await Vendor.find(filter)
        .populate("unit", "name code")
        .sort({ name: 1 });
    return vendors;
};

const getVendorById = async (vendorId, unitId) => {
    const vendor = await Vendor.findById(vendorId).populate("unit", "name code");
    if (!vendor) throw new ApiError(404, "Vendor not found");
    if (unitId && String(vendor.unit._id || vendor.unit) !== String(unitId)) {
        throw new ApiError(403, "Vendor does not belong to your unit");
    }
    return vendor;
};

export {
    createVendor,
    updateVendor,
    deactivateVendor,
    activateVendor,
    getVendors,
    getVendorById,
};
