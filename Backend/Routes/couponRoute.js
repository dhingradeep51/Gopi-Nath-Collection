import express from "express";
import {
  createCouponController,
  getCouponsController,
  deleteCouponController,
  getSingleCouponController,
  incrementCouponUsageController,
} from "../Controllers/couponController.js";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/create-coupon", requireSignIn, isAdmin, createCouponController);
router.get("/get-coupons", requireSignIn, isAdmin, getCouponsController);
router.delete("/delete-coupon/:id", requireSignIn, isAdmin, deleteCouponController);

// Public routes
router.get("/get-coupon/:name", getSingleCouponController);
router.post("/increment-usage", requireSignIn, incrementCouponUsageController);

export default router;