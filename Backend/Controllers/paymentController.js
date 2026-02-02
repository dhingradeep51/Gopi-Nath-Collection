import axios from "axios";
import crypto from "crypto";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

// 🚀 INITIALIZE PAYMENT
export const initiatePayment = async (req, res) => {
  try {
    const { products, address, financials, buyerId } = req.body;
    
    const merchantTransactionId = `MT${Date.now()}`;
    const orderNumber = `GNC${Date.now()}`;

    // 1. Create Payment record (PENDING)
    const newPayment = await new Payment({
      merchantTransactionId,
      amount: financials.totalPaid,
      status: "PENDING",
    }).save();

    // 2. Create Order record linked to Payment
    const newOrder = await new Order({
      products,
      buyer: buyerId,
      address,
      orderNumber,
      paymentDetails: newPayment._id,
      ...financials,
    }).save();

    // 3. PhonePe Payload
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: buyerId,
      amount: financials.totalPaid * 100, // Amount in Paise
      redirectUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      redirectMode: "POST",
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum = crypto.createHash('sha256')
      .update(base64Payload + "/pg/v1/pay" + process.env.PHONEPE_SALT_KEY)
      .digest('hex') + "###" + process.env.PHONEPE_SALT_INDEX;

    const response = await axios.post(
      "https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay",
      { request: base64Payload },
      { headers: { "Content-Type": "application/json", "X-VERIFY": checksum, "accept": "application/json" } }
    );

    res.status(200).send({
      success: true,
      url: response.data.data.instrumentResponse.redirectInfo.url,
    });

  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).send({ success: false, message: "Payment initiation failed" });
  }
};

// ✅ CHECK PAYMENT STATUS (The Callback)
export const checkStatus = async (req, res) => {
  const { merchantTransactionId } = req.params;
  const merchantId = process.env.PHONEPE_MERCHANT_ID;

  // 1. Generate Status Check Checksum
  const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.PHONEPE_SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + "###" + process.env.PHONEPE_SALT_INDEX;

  const options = {
    method: 'GET',
    url: `https://api-preprod.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': merchantId
    }
  };

  try {
    const response = await axios.request(options);

    if (response.data.success === true) {
      // 2. Update Payment Model
      const updatedPayment = await Payment.findOneAndUpdate(
        { merchantTransactionId },
        { status: "SUCCESS", transactionId: response.data.data.transactionId },
        { new: true }
      );

      // 3. Update Order Model
      await Order.findOneAndUpdate(
        { paymentDetails: updatedPayment._id },
        { status: "Processing", "payment.success": true }
      );

      // 4. Redirect to Frontend Success Page
      res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
    }
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  }
};