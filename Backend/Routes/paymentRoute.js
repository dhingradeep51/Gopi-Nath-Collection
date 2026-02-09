import express from "express";
import { 
  requireSignIn, 
  isUserActive 
} from "../Middlewares/authMiddleware.js"; // Import your auth logic
import {
  phonePeWebhookController,
  phonePeRedirectHandler,
  getPaymentStatusController
} from "../Controllers/paymentController.js";

const router = express.Router();

// 🔔 Webhook (PhonePe server calls this)
// Keep this PUBLIC: PhonePe cannot send your app's JWT token
router.post("/phonepe/webhook", phonePeWebhookController);

// 🧭 Redirect (User browser comes here after payment)
// Keep this PUBLIC: It handles the browser transition
router.get("/phonepe/redirect", phonePeRedirectHandler);

// 📊 Get payment status (Frontend polling)
// Make this PRIVATE: Only the logged-in user should see their payment status
// Adding requireSignIn fixes the 401 error by matching the frontend token
router.get(
  "/status/:orderNumber", 
  requireSignIn, 
  isUserActive, 
  getPaymentStatusController
);

export default router;