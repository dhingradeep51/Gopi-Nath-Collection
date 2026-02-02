import axios from "axios";
import crypto from "crypto";
import moment from "moment";
import orderModel from "../Models/orderModel.js";
import PaymentModel from "../Models/paymentModel.js";
import ProductModel from "../Models/productModel.js";

const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pgsandbox";

// 🚀 INITIATE PAYMENT (SANDBOX)
export const initiatePayment = async (req, res) => {
  try {
    const { cart, address, financials, buyerId } = req.body;

    const merchantTransactionId = `MT${Date.now()}`;
    const orderNumber = `GN-${moment().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)}`;

    // 1️⃣ Save Payment
    const newPayment = await new PaymentModel({
      merchantTransactionId,
      amount: financials.totalPaid,
      status: "PENDING",
      method: "online"
    }).save();

    // 2️⃣ Save Order
    await new orderModel({
      products: cart,
      buyer: buyerId,
      address,
      orderNumber,
      paymentDetails: newPayment._id,
      subtotal: financials.subtotal,
      totalPaid: financials.totalPaid,
      shippingFee: financials.shippingFee || 0,
      discount: financials.discount || 0,
      status: "Not Processed"
    }).save();

    // 3️⃣ PhonePe Payload
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: buyerId,
      amount: Math.round(financials.totalPaid * 100), // paise
      redirectUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      redirectMode: "POST",
      callbackUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      paymentInstrument: { type: "PAY_PAGE" }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    const endpoint = "/pg/v1/pay";
    const stringToHash = base64Payload + endpoint + process.env.PHONEPE_SALT_KEY;
    const checksum =
      crypto.createHash("sha256").update(stringToHash).digest("hex") +
      "###" +
      process.env.PHONEPE_SALT_INDEX;

    const response = await axios.post(
      `${PHONEPE_BASE_URL}${endpoint}`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          accept: "application/json"
        }
      }
    );

    return res.status(200).send({
      success: true,
      url: response.data.data.instrumentResponse.redirectInfo.url
    });

  } catch (error) {
    console.error("Payment Initiation Error:", error.response?.data || error.message);
    res.status(500).send({ success: false, message: "Payment initiation failed" });
  }
};

// ✅ CHECK PAYMENT STATUS (SANDBOX)
export const checkStatus = async (req, res) => {
  const { merchantTransactionId } = req.params;
  const merchantId = process.env.PHONEPE_MERCHANT_ID;

  const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const checksum =
    crypto.createHash("sha256")
      .update(endpoint + process.env.PHONEPE_SALT_KEY)
      .digest("hex") +
    "###" +
    process.env.PHONEPE_SALT_INDEX;

  try {
    const response = await axios.get(
      `${PHONEPE_BASE_URL}${endpoint}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchantId
        }
      }
    );

    if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=true`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
    }
  } catch (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
  }
};
