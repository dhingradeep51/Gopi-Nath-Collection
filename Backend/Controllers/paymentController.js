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
    // 1. Ensure rawBody is a string (use express.text() middleware for this route)
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body); 
    const authHeader = req.headers["authorization"];

    // 2. Validate using SDK
    const callbackResponse = phonePeClient.validateCallback(
      process.env.PHONEPE_CALLBACK_USERNAME,
      process.env.PHONEPE_CALLBACK_PASSWORD,
      authHeader,
      rawBody
    );

    const { originalMerchantOrderId, state } = callbackResponse.payload;

    // 3. Find Order with Safety Check (prevents "setting status of null")
    const order = await OrderModel.findOne({ merchantOrderId: originalMerchantOrderId });
    
    if (!order) {
      console.error(`Order NOT found for ID: ${originalMerchantOrderId}`.red);
      return res.status(200).send("Order not found, but acknowledged"); // 200 stops retries
    }

    // 4. Find Payment with Safety Check
    const payment = await PaymentModel.findById(order.paymentDetails);
    
    if (!payment) {
      console.error(`Payment record missing for Order: ${order.orderNumber}`.red);
      return res.status(200).send("Payment record missing");
    }

    // 5. Safe Update
    payment.status = state === "COMPLETED" ? "PAID" : "FAILED";
    order.status = state === "COMPLETED" ? "Processing" : "Not Processed";
    
    await payment.save();
    await order.save();

    console.log(`Order ${originalMerchantOrderId} updated to ${state}`.green);
    return res.sendStatus(200); 

  } catch (err) {
    console.error("Webhook Verification Failed:".red, err.message);
    // Returning 401 tells PhonePe to retry the callback later
    return res.status(401).send("Verification Failed");
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
