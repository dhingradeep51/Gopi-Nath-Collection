import axios from "axios";
import crypto from "crypto";
import moment from "moment";
import orderModel from "../Models/orderModel.js";
import PaymentModel from "../Models/paymentModel.js";
import ProductModel from "../Models/productModel.js";

export const initiatePayment = async (req, res) => {
  try {
    const { cart, address, financials, buyerId } = req.body;
    
    // 🔍 DEBUG: Check incoming data and env variables
    console.log("--- Payment Initiation Start ---");
    console.log("Merchant ID:", process.env.PHONEPE_MERCHANT_ID);
    console.log("Salt Index:", process.env.PHONEPE_SALT_INDEX);
    // Only log the first/last few chars of the key for security
    const key = process.env.PHONEPE_SALT_KEY || "";
    console.log("Salt Key Check:", `${key.substring(0, 3)}...${key.substring(key.length - 3)}`);

    const merchantTransactionId = `MT${Date.now()}`;
    const orderNumber = `GN-${moment().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create Payment record
    const newPayment = await new PaymentModel({
      merchantTransactionId,
      amount: financials.totalPaid,
      status: "PENDING",
      method: "online"
    }).save();

    // 2. Create Order record (Fixes 'subtotal is required' error)
    // 🔍 DEBUG: Ensure financials.subtotal exists
    console.log("Subtotal value for DB:", financials.subtotal);

    const newOrder = await new orderModel({
      products: cart,
      buyer: buyerId,
      address,
      orderNumber,
      paymentDetails: newPayment._id,
      subtotal: financials.subtotal, // ✅ Required field fix
      totalPaid: financials.totalPaid,
      shippingFee: financials.shippingFee || 0,
      discount: financials.discount || 0,
      status: "Not Processed"
    }).save();

    // 3. PhonePe Payload
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: buyerId,
      amount: Math.round(financials.totalPaid * 100), 
      redirectUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      redirectMode: "POST",
      callbackUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const stringToHash = base64Payload + "/pg/v1/pay" + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + process.env.PHONEPE_SALT_INDEX;

    // 🔍 DEBUG: Check the final Header
    console.log("Generated X-VERIFY:", checksum);

    const response = await axios.post(
      "https://api.phonepe.com/apis/hermes/pg/v1/pay",
      { request: base64Payload },
      { headers: { 
          "Content-Type": "application/json", 
          "X-VERIFY": checksum, 
          "accept": "application/json" 
        } 
      }
    );

    console.log("PhonePe API Response Status:", response.status);
    console.log("--- Payment Initiation Success ---");

    res.status(200).send({
      success: true,
      url: response.data.data.instrumentResponse.redirectInfo.url,
    });

  } catch (error) {
    // 🔍 DEBUG: Catch the exact reason for the 400 error
    console.error("--- Payment Error Log ---");
    if (error.response) {
      console.error("Data:", error.response.data);
      console.error("Status:", error.response.status);
    } else {
      console.error("Message:", error.message);
    }
    res.status(500).send({ success: false, message: "Payment failed" });
  }
};
export const checkStatus = async (req, res) => {
  const { merchantTransactionId } = req.params;
  const merchantId = process.env.PHONEPE_MERCHANT_ID;

  const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.PHONEPE_SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + "###" + process.env.PHONEPE_SALT_INDEX;

  try {
    const response = await axios.get(
      `https://api.phonepe.com/apis/hermes/pg/v1/pay/${merchantId}/${merchantTransactionId}`,
      { headers: { 
          "Content-Type": "application/json", 
          "X-VERIFY": checksum, 
          "X-MERCHANT-ID": merchantId 
        } 
      }
    );

    if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
      const payment = await PaymentModel.findOneAndUpdate(
        { merchantTransactionId },
        { status: "SUCCESS", transactionId: response.data.data.transactionId },
        { new: true }
      );

      const order = await orderModel.findOneAndUpdate(
        { paymentDetails: payment._id },
        { status: "Processing" },
        { new: true }
      );

      for (const item of order.products) {
        await ProductModel.findByIdAndUpdate(item.product, { $inc: { quantity: -item.qty } });
      }

      res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=true`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
    }
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
  }
};