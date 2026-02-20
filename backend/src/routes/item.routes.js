import express from "express";
import { createItem, viewInventory } from "../controllers/item.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJwt, authorize("ims", "register_item"), createItem);
router.get("/", verifyJwt, authorize("ims", "view_inventory"), viewInventory);

export default router;
