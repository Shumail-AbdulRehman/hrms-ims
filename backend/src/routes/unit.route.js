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

router.post("/", authorize("unit", "create"), createUnit);
router.get("/", authorize("unit", "view"), getUnits);
router.get("/:id", authorize("unit", "view"), getUnitById);
router.put("/:id", authorize("unit", "update"), updateUnit);
router.patch("/:id/deactivate", authorize("unit", "deactivate"), deactivateUnit);
router.patch("/:id/activate", authorize("unit", "activate"), activateUnit);

export default router;
