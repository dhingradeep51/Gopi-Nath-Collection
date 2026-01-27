import express from "express";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddleware.js";
// ✅ Corrected spelling from 'coupanController' to 'couponController'
import { 
  createCouponController, 
  getCouponsController, 
  deleteCouponController,
  getSingleCouponController 
} from "../Controllers/couponController.js";

const router = express.Router();

// Create Coupon (Admin Only)
router.post("/create-coupon", requireSignIn, isAdmin, createCouponController);

// Get All Coupons (Admin Only)
router.get("/get-coupons", requireSignIn, isAdmin, getCouponsController);

// Delete Coupon (Admin Only)
router.delete("/delete-coupon/:id", requireSignIn, isAdmin, deleteCouponController);

// Validate Coupon (User Checkout)
router.get("/get-coupon/:name", requireSignIn, getSingleCouponController);

export default router;