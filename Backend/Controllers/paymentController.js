import axios from "axios";
import crypto from "crypto";
import Order from "../Models/orderModel.js";
import PaymentModel from "../Models/paymentModel.js";
import ProductModel from "../Models/productModel.js";

// 🚀 INITIALIZE PAYMENT
export const initiatePayment = async (req, res) => {
  try {
    const { products, address, financials, buyerId } = req.body;
    
    const merchantTransactionId = `MT${Date.now()}`;
    // Using your project's specific order naming convention
    const orderNumber = `GN-${moment().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create Payment record (PENDING)
    const newPayment = await new PaymentModel({
      merchantTransactionId,
      amount: financials.totalPaid,
      status: "PENDING",
      method: "online"
    }).save();

    // 2. Create Order record linked to Payment
    const newOrder = await new Order({
      products,
      buyer: buyerId,
      address,
      orderNumber,
      paymentDetails: newPayment._id,
      ...financials,
      status: "Not Processed"
    }).save();

    // 3. PhonePe Payload
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: buyerId,
      amount: Math.round(financials.totalPaid * 100), // Ensure amount is an integer in Paise
      redirectUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      redirectMode: "POST",
      callbackUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum = crypto.createHash('sha256')
      .update(base64Payload + "/pg/v1/pay" + process.env.PHONEPE_SALT_KEY)
      .digest('hex') + "###" + process.env.PHONEPE_SALT_INDEX;

    const response = await axios.post(
      "https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay",
      { request: base64Payload },
      { headers: { 
          "Content-Type": "application/json", 
          "X-VERIFY": checksum, 
          "accept": "application/json" 
        } 
      }
    );

    res.status(200).send({
      success: true,
      url: response.data.data.instrumentResponse.redirectInfo.url,
    });

  } catch (error) {
    console.error("Payment Initiation Error:", error);
    res.status(500).send({ success: false, message: "Payment initiation failed" });
  }
};

// ✅ CHECK PAYMENT STATUS (The Callback/Webhook)
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

    if (response.data.success === true && response.data.code === "PAYMENT_SUCCESS") {
      // 2. Update Payment Model
      const updatedPayment = await PaymentModel.findOneAndUpdate(
        { merchantTransactionId },
        { 
          status: "SUCCESS", 
          transactionId: response.data.data.transactionId,
          paymentResponse: response.data.data 
        },
        { new: true }
      );

      // 3. Update Order Model and Reduce Stock
      const updatedOrder = await Order.findOneAndUpdate(
        { paymentDetails: updatedPayment._id },
        { status: "Processing" },
        { new: true }
      );

      // Stock reduction logic for divine items
      for (const item of updatedOrder.products) {
        await ProductModel.findByIdAndUpdate(item.product, {
          $inc: { quantity: -item.qty },
        });
      }

      // 4. Redirect to Frontend Success Page
      res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=true`);
    } else {
      // Handle failed payment state
      await PaymentModel.findOneAndUpdate({ merchantTransactionId }, { status: "FAILED" });
      res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
    }
  } catch (error) {
    console.error("Status Check Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
  }
};