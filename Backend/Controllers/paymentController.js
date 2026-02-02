import axios from "axios";
import crypto from "crypto";
import moment from "moment";
import orderModel from "../Models/orderModel.js";
import PaymentModel from "../Models/paymentModel.js";
import ProductModel from "../Models/productModel.js";

// 🚀 INITIALIZE PRODUCTION PAYMENT
export const initiatePayment = async (req, res) => {
  try {
    const { cart, address, financials, buyerId } = req.body;
    
    console.log("--- Payment Initiation Start ---");
    console.log("Merchant ID:", process.env.PHONEPE_MERCHANT_ID);

    const merchantTransactionId = `MT${Date.now()}`;
    const orderNumber = `GN-${moment().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create Payment record
    const newPayment = await new PaymentModel({
      merchantTransactionId,
      amount: financials.totalPaid,
      status: "PENDING",
      method: "online"
    }).save();

    // 2. Create Order record (Fixed: subtotal is required)
    const newOrder = await new orderModel({
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

    // 3. PhonePe Payload
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: buyerId,
      amount: Math.round(financials.totalPaid * 100), // Amount in Paise
      redirectUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      redirectMode: "POST",
      callbackUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    
    // ✅ FIX: Path must be /pg/v1/pay for Live credentials
    const endpoint = "/pg/v1/pay"; 
    const stringToHash = base64Payload + endpoint + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + process.env.PHONEPE_SALT_INDEX;

    console.log("Generated X-VERIFY:", checksum);

    const response = await axios.post(
      `https://api.phonepe.com/apis/pg${endpoint}`, // ✅ LIVE URL
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
    console.error("--- Payment Initiation Error ---");
    if (error.response) {
      console.error("Data:", error.response.data);
      console.error("Status:", error.response.status);
    } else {
      console.error("Message:", error.message);
    }
    res.status(500).send({ success: false, message: "Payment initiation failed" });
  }
};

// ✅ CHECK PRODUCTION PAYMENT STATUS

export const checkStatus = async (req, res) => {
  const { merchantTransactionId } = req.params;
  const merchantId = process.env.PHONEPE_MERCHANT_ID;

  // ✅ FIX: Status path must be /pg/v1/status for Production
  const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const checksum = crypto.createHash('sha256')
    .update(endpoint + process.env.PHONEPE_SALT_KEY)
    .digest('hex') + "###" + process.env.PHONEPE_SALT_INDEX;

  try {
    const response = await axios.get(
      `https://api.phonepe.com/apis/pg${endpoint}`, 
      { headers: { 
          "Content-Type": "application/json", 
          "X-VERIFY": checksum, 
          "X-MERCHANT-ID": merchantId 
        } 
      }
    );

    if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
      // Update DB and redirect to success page
      res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=true`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
    }
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
  }
};