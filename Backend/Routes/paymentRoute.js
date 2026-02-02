import express from "express";
import { initiatePayment, checkStatus } from "../Controllers/paymentController.js";
import { requireSignIn } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/initiate", requireSignIn, initiatePayment);
router.post("/status/:merchantTransactionId", checkStatus);
router.get("/status/:merchantTransactionId", checkStatus);

export default router;
