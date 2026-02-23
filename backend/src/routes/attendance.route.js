import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
    markAttendance,
    approveBySubAdmin,
    rejectBySubAdmin,
    approveByAdmin,
    rejectByAdmin,
    getAttendance,
} from "../controllers/attendance.controller.js";

const router = Router();

router.use(verifyJwt);

// Sub Admin marks attendance (bulk)
router.post("/", authorize("attendance", "create"), markAttendance);

// View attendance (any role with attendance.view)
router.get("/", authorize("attendance", "view"), getAttendance);

// Sub Admin first-level approval/rejection
router.patch("/:id/approve-sub-admin", authorize("attendance", "approve"), approveBySubAdmin);
router.patch("/:id/reject-sub-admin", authorize("attendance", "approve"), rejectBySubAdmin);

// Admin second-level approval/rejection
router.patch("/:id/approve-admin", authorize("attendance", "approve"), approveByAdmin);
router.patch("/:id/reject-admin", authorize("attendance", "approve"), rejectByAdmin);

export default router;
