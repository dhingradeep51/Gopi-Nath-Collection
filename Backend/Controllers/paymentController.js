import OrderModel from "../Models/orderModel.js";
import PaymentModel from "../Models/paymentModel.js";

/**
 * 🔔 PHONEPE WEBHOOK CONTROLLER (V2)
 * This is the ONLY trusted source of payment confirmation
 * PhonePe server → your server
 */
export const phonePeWebhookController = async (req, res) => {
  try {
    /**
     * Expected V2 webhook structure (simplified):
     * {
     *   data: {
     *     merchantOrderId: "ORD123...",
     *     transactionId: "T2309...",
     *     state: "COMPLETED" | "FAILED"
     *   }
     * }
     */
    const event = req.body;
    const merchantOrderId = event?.data?.merchantOrderId;
    const phonePeTransactionId = event?.data?.transactionId;
    const state = event?.data?.state;

    if (!merchantOrderId || !state) {
      return res.sendStatus(400);
    }

    // 1️⃣ Find Order using merchantOrderId
    const order = await OrderModel.findOne({ merchantOrderId });
    if (!order) {
      return res.sendStatus(404);
    }

    // 2️⃣ Get linked Payment document
    const payment = await PaymentModel.findById(order.paymentDetails);
    if (!payment) {
      return res.sendStatus(404);
    }

    // 3️⃣ Update payment & order based on state
    if (state === "COMPLETED") {
      payment.status = "PAID";
      payment.transactionId = phonePeTransactionId;
      payment.paymentResponse = event;

      // Order now moves into fulfilment lifecycle
      order.status = "Processing";
    } else {
      payment.status = "FAILED";
      payment.paymentResponse = event;

      // Keep order unprocessed / failed
      order.status = "Not Processed";
    }

    await payment.save();
    await order.save();

    // PhonePe requires HTTP 200 to stop retries
    return res.sendStatus(200);

  } catch (error) {
    console.error("PhonePe Webhook Error:", error);
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

    return res.json({
      success: true,
      paymentStatus: order.paymentDetails.status,
      orderStatus: order.status
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
