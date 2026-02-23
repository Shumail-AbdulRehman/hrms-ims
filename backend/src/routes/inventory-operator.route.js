import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
    processStockIn,
    getStockRequests,
    approveStockOut,
    rejectStockOut,
    processStockReturn,
    getInventory,
    getItemById,
    getStockHistory,
} from "../controllers/inventory-operator.controller.js";
import {
    createItemCtrl,
    updateItemCtrl,
    deactivateItemCtrl,
    activateItemCtrl,
} from "../controllers/item.controller.js";

const router = Router();

router.use(verifyJwt);

// Item CRUD (Store Manager)
router.post("/items", authorize("item", "create"), createItemCtrl);
router.put("/items/:id", authorize("item", "update"), updateItemCtrl);
router.patch("/items/:id/deactivate", authorize("item", "deactivate"), deactivateItemCtrl);
router.patch("/items/:id/activate", authorize("item", "create"), activateItemCtrl);

// Stock In (Inventory Operator)
router.post("/stock-in", authorize("stock_in", "create"), processStockIn);

// Stock Requests management (Inventory Operator)
router.get("/stock-requests", authorize("stock_request", "approve"), getStockRequests);
router.patch("/stock-requests/:id/approve", authorize("stock_request", "approve"), approveStockOut);
router.patch("/stock-requests/:id/reject", authorize("stock_request", "reject"), rejectStockOut);

// Stock Returns (Inventory Operator)
router.post("/stock-returns", authorize("stock_return", "create"), processStockReturn);

// Inventory view (anyone with item.view)
router.get("/inventory", authorize("item", "view"), getInventory);
router.get("/inventory/:id", authorize("item", "view"), getItemById);
router.get("/stock-history", authorize("item", "view"), getStockHistory);

export default router;
