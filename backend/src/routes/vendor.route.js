import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
    createVendor,
    updateVendor,
    deactivateVendor,
    activateVendor,
    getVendors,
    getVendorById,
} from "../controllers/vendor.controller.js";

const router = Router();

router.use(verifyJwt);

router.post("/", authorize("ims", "manage_vendors"), createVendor);
router.get("/", authorize("ims", "manage_vendors"), getVendors);
router.get("/:id", authorize("ims", "manage_vendors"), getVendorById);
router.put("/:id", authorize("ims", "manage_vendors"), updateVendor);
router.patch("/:id/deactivate", authorize("ims", "manage_vendors"), deactivateVendor);
router.patch("/:id/activate", authorize("ims", "manage_vendors"), activateVendor);

export default router;
