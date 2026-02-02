import express from "express";
import { initiatePayment, checkStatus } from "../Controllers/paymentController.js";
import { requireSignIn } from "../Middlewares/authMiddleware.js"; // Case-sensitive!

const router = express.Router();

router.post("/initiate", requireSignIn, initiatePayment);
router.post("/status/:merchantTransactionId", checkStatus);

export default router;