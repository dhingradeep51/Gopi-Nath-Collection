import express from "express";
import { initiatePayment, checkStatus } from "../Controllers/paymentController.js";
import { requireSignIn } from "../Middlewares/authMiddleware.js"; // Ensure capital 'M'

const router = express.Router();

// 🚀 Initiate payment process
router.post("/initiate", requireSignIn, initiatePayment);

// ✅ Handles both Redirect (GET) and Callback (POST) from PhonePe
// This ensures that regardless of the redirectMode, your server captures the status
router.post("/status/:merchantTransactionId", checkStatus);
router.get("/status/:merchantTransactionId", checkStatus);

export default router;