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

// Public/User Routes
router.post("/place-order", requireSignIn, placeOrderController);
router.get("/orders", requireSignIn, getUserOrdersController);
router.put("/user-order-status/:orderId", requireSignIn, userOrderStatusController);

// ✅ ADD THIS ROUTE: This fixes the 404 error on the Order Details page
router.get("/:orderId", requireSignIn, getOrderByIdController);

// Admin Routes
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController);
router.put("/order-logistic-update/:orderId", requireSignIn, isAdmin, updateOrderLogisticsController);
router.put("/order-invoice-status/:orderId", requireSignIn, isAdmin, orderInvoiceStatusController);
router.get("/admin-stats", requireSignIn, isAdmin, getAdminStatsController);
export default router;