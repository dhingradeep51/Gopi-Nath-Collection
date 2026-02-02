import OrderModel from "../Models/orderModel.js";
import PaymentModel from "../Models/paymentModel.js";

/**
 * 🔔 PHONEPE WEBHOOK CONTROLLER (V2)
 * This is the ONLY trusted source of payment confirmation
 * PhonePe server → your server
 */
export const phonePeWebhookController = async (req, res) => {
  try {
    console.log("✅ PHONEPE WEBHOOK RECEIVED:", JSON.stringify(req.body));
    onsole.log(
  "📩 PHONEPE WEBHOOK RAW PAYLOAD:",
  JSON.stringify(req.body, null, 2)
);

    const data = req.body?.data || {};

    // 🔥 SUPPORT BOTH KEYS (THIS IS THE FIX)
    const merchantOrderId =
      data.merchantOrderId || data.merchantTransactionId;

    const transactionId = data.transactionId;
    const state = data.state;

    if (!merchantOrderId || !state) {
      console.error("❌ Missing merchantOrderId/state", data);
      return res.sendStatus(400);
    }

    const order = await OrderModel.findOne({ merchantOrderId });
    if (!order) {
      console.error("❌ Order not found for", merchantOrderId);
      return res.sendStatus(404);
    }

    const payment = await PaymentModel.findById(order.paymentDetails);
    if (!payment) return res.sendStatus(404);

    // Idempotent guard
    if (payment.status === "PAID") {
      return res.sendStatus(200);
    }

    if (state === "COMPLETED") {
      payment.status = "PAID";
      payment.transactionId = transactionId;
      payment.paymentResponse = req.body;
      order.status = "Processing";
    } else {
      payment.status = "FAILED";
      payment.paymentResponse = req.body;
      order.status = "Not Processed";
    }

    await payment.save();
    await order.save();

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook crash:", err);
    return res.sendStatus(500);
  }
};

/**
 * 🧭 PAYMENT REDIRECT HANDLER (OPTIONAL)
 * This is called after user is redirected back from PhonePe
 * DO NOT update payment status here (UI only)
 */
export const phonePeRedirectHandler = async (req, res) => {
  try {
    const { orderNumber } = req.query;
    // Just redirect user to frontend status page
    // Actual confirmation comes from webhook
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-processing/${orderNumber}`
    );
  } catch (error) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-processing?error=true`
    );
  }
};
export const getPaymentStatusController = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await OrderModel.findOne({ orderNumber })
      .populate("paymentDetails");

    if (!order) {
      return res.status(404).json({ success: false });
    }

    // Disable caching for payment status
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    return res.json({
      success: true,
      paymentStatus: order.paymentDetails.status,
      orderStatus: order.status
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
