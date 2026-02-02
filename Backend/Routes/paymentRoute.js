import express from "express";
import {
  phonePeWebhookController,
  phonePeRedirectHandler
} from "../Controllers/paymentController.js";

const router = express.Router();

// 🔔 Webhook (PhonePe server calls this)
router.post("/phonepe/webhook", phonePeWebhookController);

// 🧭 Redirect (User browser comes here)
router.get("/phonepe/redirect", phonePeRedirectHandler);

export default router;