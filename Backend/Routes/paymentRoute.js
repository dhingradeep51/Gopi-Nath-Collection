import express from "express";
import { initiatePayment, checkStatus } from "../Controllers/paymentController.js";
import { requireSignIn } from "../Middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @description Initiate PhonePe Payment
 * @route POST /api/v1/payment/initiate
 * Used by the Checkout page to get the redirect URL
 */
router.post("/initiate", requireSignIn, initiatePayment);

/**
 * @description Handle PhonePe Payment Status
 * @route POST /api/v1/payment/status/:merchantTransactionId
 * PhonePe sends a POST request here after the user completes payment
 */
router.post("/status/:merchantTransactionId", checkStatus);

export default router;