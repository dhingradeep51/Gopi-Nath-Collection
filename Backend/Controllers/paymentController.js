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
    // 1️⃣ Get raw body as string (IMPORTANT)
    const responseBodyString = JSON.stringify(req.body);

    // 2️⃣ Get Authorization header sent by PhonePe
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
      return res.sendStatus(401);
    }

    // 3️⃣ Validate callback using SDK
    const callbackResponse = phonePeClient.validateCallback(
      process.env.PHONEPE_CALLBACK_USERNAME,
      process.env.PHONEPE_CALLBACK_PASSWORD,
      authorizationHeader,
      responseBodyString
    );

    /**
     * callbackResponse structure:
     * {
     *   type: "CHECKOUT_ORDER_COMPLETED" | "CHECKOUT_ORDER_FAILED",
     *   payload: {
     *     originalMerchantOrderId,
     *     orderId,
     *     state,
     *     amount,
     *     paymentDetails[]
     *   }
     * }
     */

    const {
      originalMerchantOrderId, // this is YOUR merchantOrderId
      state,
      paymentDetails
    } = callbackResponse.payload;

    // 4️⃣ Find Order
    const order = await OrderModel.findOne({
      merchantOrderId: originalMerchantOrderId
    });

    if (!order) {
      return res.sendStatus(404);
    }

    // 5️⃣ Find Payment
    const payment = await PaymentModel.findById(order.paymentDetails);
    if (!payment) {
      return res.sendStatus(404);
    }

    // 6️⃣ Handle payment state
    if (state === "COMPLETED") {
      payment.status = "PAID";
      payment.transactionId = paymentDetails?.[0]?.transactionId;
      payment.paymentResponse = callbackResponse;

      order.status = "Processing";
    } else {
      payment.status = "FAILED";
      payment.paymentResponse = callbackResponse;

      order.status = "Not Processed";
    }

    await payment.save();
    await order.save();

    // 7️⃣ Respond 200 to stop retries
    return res.sendStatus(200);

  } catch (error) {
    console.error("PhonePe Webhook Verification Failed:", error);
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
