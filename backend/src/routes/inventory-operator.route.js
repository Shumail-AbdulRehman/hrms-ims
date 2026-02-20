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

router.post("/items", authorize("ims", "register_item"), createItemCtrl);
router.put("/items/:id", authorize("ims", "register_item"), updateItemCtrl);
router.patch("/items/:id/deactivate", authorize("ims", "register_item"), deactivateItemCtrl);
router.patch("/items/:id/activate", authorize("ims", "register_item"), activateItemCtrl);

router.post("/stock-in", authorize("ims", "process_stock_in"), processStockIn);
router.get("/stock-requests", authorize("ims", "approve_stock_out"), getStockRequests);
router.patch("/stock-requests/:id/approve", authorize("ims", "approve_stock_out"), approveStockOut);
router.patch("/stock-requests/:id/reject", authorize("ims", "approve_stock_out"), rejectStockOut);
router.post("/stock-returns", authorize("ims", "process_stock_return"), processStockReturn);
router.get("/inventory", authorize("ims", "view_inventory"), getInventory);
router.get("/inventory/:id", authorize("ims", "view_inventory"), getItemById);
router.get("/stock-history", authorize("ims", "view_inventory"), getStockHistory);

export default router;
