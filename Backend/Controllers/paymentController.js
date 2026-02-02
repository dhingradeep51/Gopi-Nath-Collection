import axios from "axios";
import crypto from "crypto";
import moment from "moment";
import PaymentModel from "../Models/paymentModel.js";
import orderModel from "../Models/orderModel.js";
import ProductModel from "../Models/productModel.js";

/**
 * 🚀 INITIATE PAYMENT
 * Handles Order creation and PhonePe UAT Sandbox Handshake
 */
export const initiatePayment = async (req, res) => {
  try {
    const { cart, address, financials, buyerId } = req.body;
    
    // 🔍 DEBUG: Monitoring Environment Variables on Render
    console.log("--- Payment Initiation Start ---");
    console.log("Merchant ID:", process.env.PHONEPE_MERCHANT_ID);
    console.log("Salt Index:", process.env.PHONEPE_SALT_INDEX);

    const merchantTransactionId = `MT${Date.now()}`;
    const orderNumber = `GN-${moment().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)}`;

    // 1️⃣ Create Payment record in MongoDB (Initial status PENDING)
    const newPayment = await new PaymentModel({
      merchantTransactionId,
      amount: financials.totalPaid,
      status: "PENDING",
      method: "online"
    }).save();

    // 2️⃣ Create Order record (Fixes 'subtotal is required' validation error)
    console.log("Subtotal value for DB:", financials.subtotal);
    const newOrder = await new orderModel({
      products: cart,
      buyer: buyerId,
      address,
      orderNumber,
      paymentDetails: newPayment._id,
      subtotal: financials.subtotal,
      totalPaid: financials.totalPaid,
      totalBaseAmount: financials.totalBaseAmount || 0,
      totalGstAmount: financials.totalGstAmount || 0,
      highestGstRate: financials.highestGstRate || 18,
      shippingFee: financials.shippingFee || 0,
      discount: financials.discount || 0,
      status: "Not Processed"
    }).save();

    // 3️⃣ PhonePe UAT Sandbox Payload Construction
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: buyerId,
      amount: Math.round(financials.totalPaid * 100), // Amount in Paise
      redirectUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      redirectMode: "POST", //
      callbackUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    
    // ✅ CHECKSUM FIX: The path must be exactly /pg/v1/pay for the hash
    const endpoint = "/pg/v1/pay"; 
    const stringToHash = base64Payload + endpoint + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + process.env.PHONEPE_SALT_INDEX;

    console.log("Generated X-VERIFY:", checksum);

    // ✅ HOST URL FIX: Use pgsandbox to avoid 'Api Mapping Not Found'
    const response = await axios.post(
      `https://api-preprod.phonepe.com/apis/pgsandbox${endpoint}`, 
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
    console.error("--- Payment Initiation Error ---");
    if (error.response) {
      console.error("API Error Data:", error.response.data);
    } else {
      console.error("General Error Message:", error.message);
    }
    res.status(500).send({ success: false, message: "Payment initiation failed" });
  }
};

/**
 * 🔄 CHECK PAYMENT STATUS
 * Called by PhonePe after user completes transaction in UAT Sandbox
 */
export const checkStatus = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    const merchantId = process.env.PHONEPE_MERCHANT_ID;

    // ✅ FIX: Match the Sandbox status endpoint path
    const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    
    // ✅ FIX: Generate X-VERIFY checksum for status API
    const stringToHash = endpoint + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + process.env.PHONEPE_SALT_INDEX;

    // ✅ HOST URL FIX: Use pgsandbox host for status check
    const response = await axios.get(
      `https://api-preprod.phonepe.com/apis/pgsandbox${endpoint}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchantId,
          accept: "application/json"
        }
      }
    );

    // ✅ UAT Sandbox success code is PAYMENT_SUCCESS
    if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
      // 1. Update Payment Record to SUCCESS
      const payment = await PaymentModel.findOneAndUpdate(
        { merchantTransactionId },
        { status: "SUCCESS", transactionId: response.data.data.transactionId },
        { new: true }
      );

      // 2. Update Order Status to Processing
      const order = await orderModel.findOneAndUpdate(
        { paymentDetails: payment._id },
        { status: "Processing" },
        { new: true }
      );

      // 3. Inventory Management: Deduct quantities
      if (order) {
        for (const item of order.products) {
          await ProductModel.findByIdAndUpdate(item.product, { 
            $inc: { quantity: -item.qty } 
          });
        }
      }

      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=true`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
    }

  } catch (error) {
    console.error("Status Check Critical Error:", error.response?.data || error.message);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
  }
};