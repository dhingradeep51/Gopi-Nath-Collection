import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  sendOTPController,
  verifyOTPController,
  updateProfileController,
  getAllUsersController,
  updateUserAdminController,
  deleteUserController,
  updateProfileAddressController // ✅ Dedicated for checkout preloading
} from "../Controllers/authControllers.js";
import { isAdmin, requireSignIn, isUserActive } from "../Middlewares/authMiddleware.js";
import { authLimiter } from "../Middlewares/rateMiddleware.js";

const router = express.Router();

// --- PUBLIC ROUTES ---
router.post("/send-otp",authLimiter, sendOTPController);
router.post("/verify-otp", verifyOTPController);
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/forgot-password", authLimiter, forgotPasswordController);

// --- USER PROTECTED ROUTES ---
// Auth Verification
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

// Profile Management (Prefilled Form)
router.put("/profile", requireSignIn, isUserActive, updateProfileController); 

// Checkout Address Update (Dedicated for Preloading)
router.put("/update-address", requireSignIn, isUserActive, updateProfileAddressController);

// --- ADMIN PROTECTED ROUTES ---
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get("/all-users", requireSignIn, isAdmin, getAllUsersController);
router.put("/update-user-admin/:id", requireSignIn, isAdmin, updateUserAdminController);
router.delete("/delete-user/:id", requireSignIn, isAdmin, deleteUserController);
router.get("/test", requireSignIn, isAdmin, testController);

export default router;