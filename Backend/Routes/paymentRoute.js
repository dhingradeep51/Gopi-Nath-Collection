import express from "express";
import { checkStatus } from "../Controllers/paymentController.js";


const router = express.Router();
router.post("/status/:merchantTransactionId", checkStatus);
router.get("/status/:merchantTransactionId", checkStatus);

export default router;
