import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
    createStockRequest,
    getMyStockRequests,
} from "../controllers/stock-request.controller.js";

const router = Router();

router.use(verifyJwt);

router.post("/", authorize("stock_request", "create"), createStockRequest);
router.get("/my", authorize("stock_request", "view"), getMyStockRequests);

export default router;
