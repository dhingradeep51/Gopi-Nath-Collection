import OrderModel from "../Models/orderModel.js";
import PaymentModel from "../Models/paymentModel.js";
import { StandardCheckoutClient, Env } from "pg-sdk-node";

/* =====================================================
   📌 PHONEPE CLIENT INITIALIZATION
   ===================================================== */
import { phonePeClient } from "../Utils/phonepeClient.js";

/**
 * 🔐 PHONEPE WEBHOOK WITH CALLBACK VERIFICATION (V2)
 */
export const phonePeWebhookController = async (req, res) => {
  try {
    const rawBody = req.body; 
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];

    const callbackResponse = phonePeClient.validateCallback(
      process.env.PHONEPE_CALLBACK_USERNAME,
      process.env.PHONEPE_CALLBACK_PASSWORD,
      authHeader,
      rawBody
    );

    if (!callbackResponse || !callbackResponse.payload) {
      console.error("Webhook Verification Failed: Invalid payload".red);
      return res.status(401).send("Verification Failed");
    }

    // 🛡️ FIX: Try both possible ID fields from the SDK payload
    const payload = callbackResponse.payload;
    const orderId = payload.merchantOrderId || payload.originalMerchantOrderId;
    const state = payload.state;

    console.log(`Webhook received for ${orderId}: ${state}`.cyan);

    if (!orderId) {
      console.error("Critical Error: Order ID is missing from PhonePe payload".red);
      return res.sendStatus(200); 
    }

    // 1. Find the order using the corrected ID
    const order = await OrderModel.findOne({ merchantOrderId: orderId });
    if (!order) {
      console.error(`Order not found in DB for ID: ${orderId}`.red);
      return res.sendStatus(200); 
    }

    // 2. Find and update Payment record
    const payment = await PaymentModel.findById(order.paymentDetails);
    if (payment) {
      const isSuccess = state === "COMPLETED";
      
      payment.status = isSuccess ? "PAID" : "FAILED";
      order.status = isSuccess ? "Processing" : "Not Processed";
      
      await payment.save();
      await order.save();

      console.log(`Order ${orderId} successfully updated to ${payment.status}`.green);
    }

    return res.sendStatus(200); 
  } catch (err) {
    console.error("Webhook Internal Error:".red, err.message);
    return res.status(500).send("Error processing webhook");
  }
};
/* =====================================================
   🧭 PHONEPE REDIRECT HANDLER (UI ONLY)
   ===================================================== */
export const phonePeRedirectHandler = async (req, res) => {
  try {
    const { orderNumber } = req.query;

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-processing/${orderNumber}`
    );
  } catch (error) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-processing?error=true`
    );
  }
};

/* =====================================================
   📊 PAYMENT STATUS (FRONTEND POLLING)
   ===================================================== */
export const getPaymentStatusController = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await OrderModel.findOne({ orderNumber })
      .populate("paymentDetails");

    if (!order) {
      return res.status(404).json({ success: false });
    }

    // Disable caching (important for polling)
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store"
    });

    return res.json({
      success: true,
      paymentStatus: order.paymentDetails.status,
      orderStatus: order.status
    });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
