import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
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

router.post("/create", authorize("hrms", "manage_users"), createPersonnel);
router.get("/", authorize("hrms", "manage_users"), getPersonnel);
router.get("/:id", authorize("hrms", "manage_users"), getPersonnelById);
router.put("/:id", authorize("hrms", "manage_users"), updatePersonnel);

export default router;
