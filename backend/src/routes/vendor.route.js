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

router.post("/", authorize("vendor", "create"), createVendor);
router.get("/", authorize("vendor", "view"), getVendors);
router.get("/:id", authorize("vendor", "view"), getVendorById);
router.put("/:id", authorize("vendor", "update"), updateVendor);
router.patch("/:id/deactivate", authorize("vendor", "deactivate"), deactivateVendor);
router.patch("/:id/activate", authorize("vendor", "deactivate"), activateVendor);

export default router;
