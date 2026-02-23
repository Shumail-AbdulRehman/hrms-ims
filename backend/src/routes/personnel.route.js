import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorize, authorizeAny } from "../middlewares/authorize.middleware.js";
import {
    signIn,
    createPersonnel,
    updatePersonnel,
    getPersonnel,
    getPersonnelById,
} from "../controllers/personnel.controller.js";

const router = Router();

router.post("/signIn", signIn);

router.use(verifyJwt);

router.post("/create", authorize("employee", "create"), createPersonnel);
router.get("/", authorizeAny(["employee", "view"], ["employee", "view_own"]), getPersonnel);
router.get("/:id", authorizeAny(["employee", "view"], ["employee", "view_own"]), getPersonnelById);
router.put("/:id", authorize("employee", "update"), updatePersonnel);

export default router;
