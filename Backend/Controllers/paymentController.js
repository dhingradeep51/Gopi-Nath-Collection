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

    const payload = callbackResponse.payload;
    const orderId = payload.merchantOrderId || payload.originalMerchantOrderId;
    const state = payload.state;

    // 1. Find the order
    const order = await OrderModel.findOne({ merchantOrderId: orderId });
    if (!order) {
      console.error(`Order not found in DB for ID: ${orderId}`.red);
      return res.sendStatus(200); 
    }

    // 2. Update status safely
    const payment = await PaymentModel.findById(order.paymentDetails);
    if (payment) {
      const isSuccess = state === "COMPLETED";
      
      payment.status = isSuccess ? "PAID" : "FAILED";
      order.status = isSuccess ? "Processing" : "Not Processed";
      
      await payment.save();
      const updatedOrder = await order.save();

      // LOG FOR VERIFICATION
      console.log(`✅ DB CONFIRMED: ${updatedOrder.merchantOrderId} is now ${updatedOrder.status}`.green);

      // 🚀 SOCKET TRIGGER: Instantly tell the frontend to redirect
      const io = req.app.get("io");
      io.to(order.orderNumber).emit("payment_update", { 
        paymentStatus: payment.status 
      });
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
