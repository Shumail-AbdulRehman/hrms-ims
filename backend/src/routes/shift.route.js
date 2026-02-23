import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
    createShift,
    updateShift,
    approveShift,
    rejectShift,
    getShifts,
} from "../controllers/shift.controller.js";

const router = Router();

router.use(verifyJwt);

// Supervisor creates/updates shifts
router.post("/", authorize("shift", "create"), createShift);
router.put("/:id", authorize("shift", "update"), updateShift);

// Sub Admin approves/rejects shifts
router.patch("/:id/approve", authorize("shift", "approve"), approveShift);
router.patch("/:id/reject", authorize("shift", "approve"), rejectShift);

// View shifts (any role with shift.view)
router.get("/", authorize("shift", "view"), getShifts);

export default router;
