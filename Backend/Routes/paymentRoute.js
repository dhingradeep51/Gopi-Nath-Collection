import express from "express";
import { initiatePayment, checkStatus } from "../Controllers/paymentController.js";
import { requireSignIn } from "../Middlewares/authMiddleware.js"; // Ensure 'Middlewares' matches your folder name

const router = express.Router();

/**
 * @description Initiate PhonePe Payment
 * @route POST /api/v1/payment/initiate
 */
router.post("/initiate", requireSignIn, initiatePayment);

/**
 * @description Handle PhonePe Payment Status Redirect/Callback
 * @route POST /api/v1/payment/status/:merchantTransactionId
 */
router.post("/status/:merchantTransactionId", checkStatus);

export default router;