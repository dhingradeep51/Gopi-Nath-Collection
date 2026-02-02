import axios from "axios";
import crypto from "crypto";
import PaymentModel from "../Models/paymentModel.js";
import orderModel from "../Models/orderModel.js";
import ProductModel from "../Models/productModel.js";

export const initiatePayment = async (req, res) => {
  try {
    const { cart, address, financials, buyerId } = req.body;
    
    // 🔍 DEBUG: Check environment variables in Render
    console.log("--- Payment Initiation Start ---");
    console.log("Merchant ID:", process.env.PHONEPE_MERCHANT_ID);
    console.log("Salt Index:", process.env.PHONEPE_SALT_INDEX);

    const merchantTransactionId = `MT${Date.now()}`;
    const orderNumber = `GN-${moment().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create Payment record in MongoDB
    const newPayment = await new PaymentModel({
      merchantTransactionId,
      amount: financials.totalPaid,
      status: "PENDING",
      method: "online"
    }).save();

    // 2. Create Order record (Fixes 'subtotal is required')
    console.log("Subtotal value for DB:", financials.subtotal);

    const newOrder = await new orderModel({
      products: cart,
      buyer: buyerId,
      address,
      orderNumber,
      paymentDetails: newPayment._id,
      subtotal: financials.subtotal, 
      totalPaid: financials.totalPaid,
      totalBaseAmount: financials.totalBaseAmount || 0, // Required by your schema
      totalGstAmount: financials.totalGstAmount || 0,   // Required by your schema
      highestGstRate: financials.highestGstRate || 18,  // Required by your schema
      shippingFee: financials.shippingFee || 0,
      discount: financials.discount || 0,
      status: "Not Processed"
    }).save();

    // 3. PhonePe UAT Sandbox Payload
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
    
    // ✅ FIX: Path must be /pg/v1/pay for the checksum calculation
    const endpoint = "/pg/v1/pay"; 
    const stringToHash = base64Payload + endpoint + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + process.env.PHONEPE_SALT_INDEX;

    console.log("Generated X-VERIFY:", checksum);

    // ✅ FIX: Host URL must include /pgsandbox for UAT testing
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
    console.error("--- Payment Error Log ---");
    if (error.response) {
      console.error("Data:", error.response.data);
      console.error("Status:", error.response.status);
    } else {
      console.error("Message:", error.message);
    }
    res.status(500).send({ success: false, message: "Payment initiation failed" });
  }
};
export const checkStatus = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    const merchantId = process.env.PHONEPE_MERCHANT_ID;

    // ✅ FIX 1: Use the Sandbox endpoint path for UAT testing
    const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    
    // ✅ FIX 2: Generate X-VERIFY checksum (Required for Standard Checkout V1/V2)
    const stringToHash = endpoint + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + process.env.PHONEPE_SALT_INDEX;

    // ✅ FIX 3: Update the Host URL to include /pgsandbox
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

    // ✅ PhonePe UAT Sandbox returns PAYMENT_SUCCESS for success simulations
    if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
      // 1. Update Payment Record
      const payment = await PaymentModel.findOneAndUpdate(
        { merchantTransactionId },
        { status: "SUCCESS", transactionId: response.data.data.transactionId },
        { new: true }
      );

      // 2. Update Order Status
      const order = await orderModel.findOneAndUpdate(
        { paymentDetails: payment._id },
        { status: "Processing" },
        { new: true }
      );

      // 3. Inventory Management: Reduce stock for purchased items
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
    // 🔍 Log the detailed error to fix the 400/404 issues
    console.error("Status Check Error:", error.response?.data || error.message);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard/user/orders?success=false`);
  }
};