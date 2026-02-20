import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
    createStockRequest,
    getMyStockRequests,
} from "../controllers/stock-request.controller.js";

const router = Router();

router.use(verifyJwt);

router.post("/", authorize("ims", "request_stock_out"), createStockRequest);
router.get("/my", authorize("ims", "request_stock_out"), getMyStockRequests);

export default router;
