import express from "express";
import {
  phonePeWebhookController,
  phonePeRedirectHandler,
  getPaymentStatusController
} from "../Controllers/paymentController.js";

const router = express.Router();

// 🔔 Webhook (PhonePe server calls this)
router.post("/phonepe/webhook", phonePeWebhookController);

// 🧭 Redirect (User browser comes here)
router.get("/phonepe/redirect", phonePeRedirectHandler);

// 📊 Get payment status
router.get("/status/:orderNumber", getPaymentStatusController);

export default router;