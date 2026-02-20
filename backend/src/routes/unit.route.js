import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
    createUnit,
    updateUnit,
    deactivateUnit,
    activateUnit,
    getUnits,
    getUnitById,
} from "../controllers/unit.controller.js";

const router = Router();

router.use(verifyJwt);

router.post("/", authorize("units", "manage"), createUnit);
router.get("/", authorize("units", "manage"), getUnits);
router.get("/:id", authorize("units", "manage"), getUnitById);
router.put("/:id", authorize("units", "manage"), updateUnit);
router.patch("/:id/deactivate", authorize("units", "manage"), deactivateUnit);
router.patch("/:id/activate", authorize("units", "manage"), activateUnit);

export default router;
