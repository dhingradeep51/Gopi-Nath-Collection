import OrderModel from "../Models/orderModel.js";
import PaymentModel from "../Models/paymentModel.js";
import { StandardCheckoutClient, Env } from "pg-sdk-node";

/* =====================================================
   📌 PHONEPE CLIENT INITIALIZATION
   ===================================================== */
import { phonePeClient } from "../Utils/phonepeClient.js";

/**
 * 🔐 PHONEPE WEBHOOK CONTROLLER (V2)
 * Corrected to match database field: merchantTransactionId
 */
export const phonePeWebhookController = async (req, res) => {
  try {
    const rawBody = req.body; // Captured as string/text via middleware
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];

    // 1. SDK V2 Verification
    const callbackResponse = phonePeClient.validateCallback(
      process.env.PHONEPE_CALLBACK_USERNAME,
      process.env.PHONEPE_CALLBACK_PASSWORD,
      authHeader,
      rawBody
    );

    // 2. Check if verification was successful
    if (!callbackResponse || !callbackResponse.payload) {
      console.error("❌ Webhook Verification Failed: Invalid payload".red);
      return res.status(401).send("Verification Failed");
    }

    const { merchantOrderId, originalMerchantOrderId, state } = callbackResponse.payload;
    
    // Use whichever ID field PhonePe populated
    const transactionIdFromPhonePe = merchantOrderId || originalMerchantOrderId;

    console.log(`Checking Webhook for ID: ${transactionIdFromPhonePe}, State: ${state}`.cyan);

    // 3. Find Payment record using the CORRECT field name from your DB
    const payment = await PaymentModel.findOne({ 
      merchantTransactionId: transactionIdFromPhonePe 
    });

    if (!payment) {
      console.error(`❌ Payment record NOT found for: ${transactionIdFromPhonePe}`.red);
      return res.sendStatus(200); // 200 stops PhonePe retries
    }

    // 4. Determine Success
    const isSuccess = state === "COMPLETED";

    // 5. Update Payment Status in DB
    payment.status = isSuccess ? "PAID" : "FAILED";
    await payment.save();

    // 6. Find and Update the Linked Order
    const order = await OrderModel.findOne({ paymentDetails: payment._id });
    
    if (order) {
      order.status = isSuccess ? "Processing" : "Not Processed";
      await order.save();

      // 🚀 SOCKET TRIGGER: Instantly update frontend
      const io = req.app.get("io");
      if (io) {
        io.to(order.orderNumber).emit("payment_update", { 
          paymentStatus: payment.status,
          orderStatus: order.status 
        });
      }

      console.log(`✅ DB SUCCESSFULLY UPDATED: ${transactionIdFromPhonePe} is now ${payment.status}`.green);
    } else {
      console.warn(`⚠️ Payment found but no linked Order for: ${transactionIdFromPhonePe}`.yellow);
    }

    return res.sendStatus(200); 

  } catch (err) {
    console.error("❌ Webhook Internal Error:".red, err.message);
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
