import express from "express";
import { isAdmin, requireSignIn } from "../Middlewares/authMiddleware.js";
import {
  placeOrderController,
  getAllOrdersController,
  getUserOrdersController,
  orderStatusController,
  updateOrderLogisticsController,
  userOrderStatusController,
  orderInvoiceStatusController,
  getOrderByIdController,
  getAdminStatsController
} from "../Controllers/orderController.js";

const router = express.Router();

// ✅ IMPORTANT: Specific routes MUST come before generic routes to avoid parameter conflicts
// Public/User Routes
router.post("/place-order", requireSignIn, placeOrderController);
router.get("/orders", requireSignIn, getUserOrdersController);

// Admin Routes (specific admin routes before generic :orderId route)
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
router.get("/admin-stats", requireSignIn, isAdmin, getAdminStatsController);

// Status update routes (more specific than generic :orderId GET)
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController);
router.put("/order-logistic-update/:orderId", requireSignIn, isAdmin, updateOrderLogisticsController);
router.put("/order-invoice-status/:orderId", requireSignIn, isAdmin, orderInvoiceStatusController);
router.put("/user-order-status/:orderId", requireSignIn, userOrderStatusController);

// Generic route - MUST be last
router.get("/:orderId", requireSignIn, getOrderByIdController);
export default router;