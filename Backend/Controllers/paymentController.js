import OrderModel from "../Models/orderModel.js";
import PaymentModel from "../Models/paymentModel.js";

const phonePeClient = StandardCheckoutClient.getInstance(
  process.env.PHONEPE_CLIENT_ID,
  process.env.PHONEPE_CLIENT_SECRET,
  Number(process.env.PHONEPE_CLIENT_VERSION || 1),
  process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX
);

/**
 * 🔔 PhonePe V2 Webhook (S2S Ready)
 */
export const phonePeWebhookController = async (req, res) => {
  try {
    console.log("📩 PHONEPE WEBHOOK:", JSON.stringify(req.body, null, 2));

    /* =====================================================
       🔐 OPTIONAL S2S VALIDATION (FUTURE SAFE)
       ===================================================== */
    if (process.env.PHONEPE_ENABLE_S2S === "true") {
      const authorizationHeader = req.headers["authorization"];
      if (!authorizationHeader) {
        console.error("❌ Missing Authorization header");
        return res.sendStatus(401);
      }

      try {
        phonePeClient.validateCallback(
          process.env.PHONEPE_WEBHOOK_USERNAME,
          process.env.PHONEPE_WEBHOOK_PASSWORD,
          authorizationHeader,
          JSON.stringify(req.body)
        );
      } catch (err) {
        console.error("❌ Invalid PhonePe signature");
        return res.sendStatus(401);
      }
    }

    /* =====================================================
       📦 PAYLOAD PARSING
       ===================================================== */
    const data = req.body?.data;
    if (!data) return res.sendStatus(400);

    const merchantTransactionId =
      data.merchantTransactionId || data.merchantOrderId;

    const transactionId = data.transactionId;
    const state = data.state; // COMPLETED | FAILED | CANCELLED

    if (!merchantTransactionId || !state) {
      return res.sendStatus(400);
    }

    /* =====================================================
       🔎 DB LOOKUP
       ===================================================== */
    const order = await OrderModel.findOne({
      merchantOrderId: merchantTransactionId
    });

    if (!order) return res.sendStatus(404);

    const payment = await PaymentModel.findById(order.paymentDetails);
    if (!payment) return res.sendStatus(404);

    /* =====================================================
       🛡 IDEMPOTENCY
       ===================================================== */
    if (payment.status === "SUCCESS" || payment.status === "FAILED") {
      return res.sendStatus(200);
    }

    /* =====================================================
       ✅ STATE HANDLING
       ===================================================== */
    if (state === "COMPLETED") {
      payment.status = "SUCCESS";
      payment.transactionId = transactionId;
      order.status = "Processing";
    } else {
      payment.status = "FAILED";
      order.status = "Not Processed";
    }

    payment.paymentResponse = req.body;

    await payment.save();
    await order.save();

    console.log(
      `✅ PAYMENT UPDATED: ${merchantTransactionId} → ${payment.status}`
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error("🚨 PhonePe Webhook Error:", error);
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
