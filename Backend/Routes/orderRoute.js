import express from "express";
import { isAdmin, requireSignIn } from "../Middlewares/authMiddleware.js";
import {
  placeOrderController,
  getAllOrdersController,
  getOrdersController,
  orderStatusController,
  updateOrderLogisticsController,
  userOrderStatusController,
  orderInvoiceStatusController,
} from "../Controllers/orderController.js";

const router = express.Router();

// Public/User Routes
router.post("/place-order", requireSignIn, placeOrderController);
router.get("/orders", requireSignIn, getOrdersController);
router.put("/user-order-status/:orderId", requireSignIn, userOrderStatusController);


// Admin Routes
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController);
router.put("/order-logistic-update/:orderId", requireSignIn, isAdmin, updateOrderLogisticsController);
router.put("/order-invoice-status/:orderId", requireSignIn, isAdmin, orderInvoiceStatusController);

export default router;