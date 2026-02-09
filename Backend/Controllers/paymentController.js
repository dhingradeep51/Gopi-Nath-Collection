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
    const rawBody = req.body; // Captured as string by express.text()
    const authHeader = req.headers["authorization"];

    // SDK V2 Verification
    const callbackResponse = phonePeClient.validateCallback(
      process.env.PHONEPE_CALLBACK_USERNAME,
      process.env.PHONEPE_CALLBACK_PASSWORD,
      authHeader,
      rawBody
    );

    const { originalMerchantOrderId, state } = callbackResponse.payload;

    // Update DB
    const order = await OrderModel.findOne({ merchantOrderId: originalMerchantOrderId });
    if (order) {
      const payment = await PaymentModel.findById(order.paymentDetails);
      payment.status = state === "COMPLETED" ? "PAID" : "FAILED";
      order.status = state === "COMPLETED" ? "Processing" : "Not Processed";
      
      await payment.save();
      await order.save();
    }

    return res.sendStatus(200); // Tell PhonePe we received it
  } catch (err) {
    console.error("Webhook Verification Failed:", err.message);
    return res.sendStatus(401);
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
