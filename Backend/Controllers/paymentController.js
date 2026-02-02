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
    console.log("🔥 PhonePe Webhook HIT");

    const rawBody = req.body.toString();
    const authorizationHeader = req.headers["authorization"];

    console.log("Authorization:", authorizationHeader);
    console.log("Raw Body:", rawBody);

    const callbackResponse = phonePeClient.validateCallback(
      process.env.PHONEPE_CALLBACK_USERNAME,
      process.env.PHONEPE_CALLBACK_PASSWORD,
      authorizationHeader,
      rawBody
    );

    console.log("✅ Verified Callback:", callbackResponse);

    const { originalMerchantOrderId, state, paymentDetails } =
      callbackResponse.payload;

    const order = await OrderModel.findOne({
      merchantOrderId: originalMerchantOrderId
    });

    if (!order) {
      console.error("❌ Order not found");
      return res.sendStatus(404);
    }

    const payment = await PaymentModel.findById(order.paymentDetails);

    if (state === "COMPLETED") {
      payment.status = "PAID";
      payment.transactionId = paymentDetails?.[0]?.transactionId;
      order.status = "Processing";
    } else {
      payment.status = "FAILED";
      order.status = "Not Processed";
    }

    await payment.save();
    await order.save();

    console.log("✅ Payment & Order updated");
    return res.sendStatus(200);

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return res.sendStatus(500);
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
