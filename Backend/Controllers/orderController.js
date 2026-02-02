import orderModel from "../Models/orderModel.js";
import moment from "moment";
import ProductModel from "../Models/productModel.js";
import PaymentModel from "../Models/paymentModel.js";
import userModel from "../Models/userModel.js";
// ✅ Ensure the import path and filename match your utils folder exactly
import { sendNotification } from "../Utils/notificationUtils.js";
import axios from "axios";
import crypto from "crypto";
// --- PLACE NEW ORDER ---
import { getPhonePeV2Token } from "../Utils/phonepeAuth.js";


/**
 * 🚀 PLACE ORDER CONTROLLER
 * Handles GST calculations, DB persistence, and PhonePe UAT Handshake
 */
export const placeOrderController = async (req, res) => {
  try {
    const { cart, address, paymentMethod, shippingFee = 0, discount = 0 } = req.body;

    // 1️⃣ Validation: Ensure cart is not empty
    if (!cart || cart.length === 0) {
      return res.status(400).send({ success: false, message: "Cart is empty" });
    }

    const products = [];
    let subtotal = 0;
    let totalBaseAmount = 0;
    let totalGstAmount = 0;
    let highestGstRate = 0;

    // 2️⃣ Process Items & GST Calculations (Required for Schema)
    for (const item of cart) {
      const product = await ProductModel.findById(item._id);
      if (!product) continue;

      const qty = item.cartQuantity || 1;
      const price = product.price;
      const gstRate = product.gstRate || 18;
      
      // Calculate Base Price and GST Amount
      const basePrice = price / (1 + gstRate / 100);
      const gstAmount = price - basePrice; // ✅ Fixed naming to avoid 'not defined' error

      subtotal += price * qty;
      totalBaseAmount += basePrice * qty;
      totalGstAmount += gstAmount * qty;
      
      if (gstRate > highestGstRate) highestGstRate = gstRate;

      products.push({
        product: product._id,
        name: product.name,
        qty,
        price: Number(price.toFixed(2)),
        gstRate,
        basePrice: Number(basePrice.toFixed(2)),
        gstAmount: Number(gstAmount.toFixed(2))
      });
    }

    const totalPaid = subtotal + shippingFee - discount;
    const merchantTransactionId = `MT${Date.now()}`;
    const orderNumber = `GN-${moment().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)}`;

    // 3️⃣ Save Payment Reference (Initial Status: PENDING)
    const payment = await new PaymentModel({
      merchantTransactionId,
      amount: totalPaid,
      status: "PENDING",
      method: paymentMethod
    }).save();

    // 4️⃣ Create Order: Include all 'required' schema fields
    const order = await orderModel.create({
      products,
      buyer: req.user._id,
      address,
      paymentDetails: payment._id,
      orderNumber,
      subtotal: Number(subtotal.toFixed(2)), // ✅ Required field fix
      totalPaid: Number(totalPaid.toFixed(2)),
      totalBaseAmount: Number(totalBaseAmount.toFixed(2)),
      totalGstAmount: Number(totalGstAmount.toFixed(2)),
      highestGstRate,
      shippingFee,
      discount,
      status: "Not Processed"
    });

    // 5️⃣ Cash on Delivery Flow
    if (paymentMethod === "cod") {
      return res.status(201).send({ success: true, message: "Order placed (COD)", order });
    }

    // 🚀 6️⃣ PHONEPE UAT SANDBOX HANDSHAKE
 const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: req.user._id,
      amount: Math.round(totalPaid * 100), // convert to paise
      redirectUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      redirectMode: "POST", 
      callbackUrl: `${process.env.BACKEND_URL}/api/v1/payment/status/${merchantTransactionId}`,
      paymentInstrument: { type: "PAY_PAGE" }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    
    // ✅ CHECKSUM FIX: The path string in the hash must match the endpoint called below
    const endpoint = "/pg/v1/pay"; 
    const stringToHash = base64Payload + endpoint + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = `${sha256}###${process.env.PHONEPE_SALT_INDEX}`;

    // 🔍 DEBUG LOGS: Check these in your Render console
    const fullURL = `https://api-preprod.phonepe.com/apis/pgsandbox${endpoint}`;
    console.log("--- PhonePe API Request Details ---");
    console.log("Full Request URL:", fullURL); // Checks for 'pgsandbox' mapping
    console.log("Endpoint Path used in Checksum:", endpoint);
    console.log("X-VERIFY Checksum:", checksum);

    const response = await axios.post(
      fullURL, 
      { request: base64Payload },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": checksum
        }
      }
    );
    // Return the secure redirect URL to the frontend
    return res.status(200).send({
      success: true,
      url: response.data.data.instrumentResponse.redirectInfo.url
    });

  } catch (error) {
    // 🔍 Debug log for Render
    console.error("Critical Order Error:", error.response?.data || error.message);
    return res.status(500).send({ success: false, message: "Payment initiation failed" });
  }
};


export const getAllOrdersController = async (req, res) => {

  try {

    const orders = await orderModel

      .find({})

      .populate({

        path: "products.product",

        select: "name slug photo",

      })

      .populate("buyer", "name phone email state address")

      // ✅ ADDED: cancelReason and returnReason to the selection

      // Add these to your select() call in the controller

      .select("orderNumber products buyer status payment isInvoiced invoiceNo createdAt cancelReason returnReason isApprovedByAdmin")

      .sort({ createdAt: -1 });



    res.status(200).json(orders);

  } catch (error) {

    console.error("Get all orders error:", error);

    res.status(500).json({

      success: false,

      message: "Error fetching all orders",

      error: error.message,

    });

  }

};



// --- UPDATE ORDER STATUS (ADMIN ONLY) ---
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updateData = { status };
    if (status === "Cancel" || status === "Return") updateData.isApprovedByAdmin = true;

    const updated = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true }).populate("buyer", "name");

    // ✅ TRIGGER: INVOICE ALERT (If status set to Delivered but isInvoiced is false)
    if (status === "Delivered" && !updated.isInvoiced) {
      sendNotification(req, "INVOICE_ALERT", { orderId: updated.orderNumber });
    }

    res.status(200).send({ success: true, updated });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};
// --- UPDATE LOGISTICS (AWB & TRACKING) ---
export const updateOrderLogisticsController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { awbNumber, trackingLink } = req.body;

    if (req.user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Admin access required"
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { awbNumber, trackingLink },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Logistics updated",
      updatedOrder
    });
  } catch (error) {
    console.error("Update logistics error:", error);
    res.status(500).send({
      success: false,
      message: "Error updating logistics",
      error: error.message
    });
  }
};
// --- USER ACTION: CANCEL OR RETURN ORDER ---
export const userOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).send({ success: false, message: "Order not found" });

    let newStatus;
    let notificationType; // ✅ FIX: Must declare with 'let' to prevent 500 crash

    if (status === "Cancel") {
      newStatus = "Cancel Request";
      notificationType = "CANCEL_REQUEST";
    } else if (status === "Return") {
      newStatus = "Return Request";
      notificationType = "RETURN_REQUEST";
    }

    // ✅ Trigger socket ONLY if a type was assigned
    if (notificationType) {
      sendNotification(req, notificationType, { orderId: order.orderNumber });
    }

    const updated = await orderModel.findByIdAndUpdate(orderId, {
      status: newStatus,
      cancelReason: status === "Cancel" ? reason.trim() : order.cancelReason,
      returnReason: status === "Return" ? reason.trim() : order.returnReason,
      isApprovedByAdmin: false,
      updatedAt: Date.now()
    }, { new: true });

    res.status(200).send({ success: true, message: "Request submitted", order: updated });
  } catch (error) {
    console.error("Notification Trigger Error:", error); // Logs error in Render console
    res.status(500).send({ success: false, error: error.message });
  }
};
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate({
        path: "products.product",
        select: "name photo"
      })
      .sort({ createdAt: -1 });

    res.status(200).send(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching your orders",
      error: error.message
    });
  }
};
// --- MANAGE INVOICE STATUS ---
export const orderInvoiceStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { isInvoiced, invoiceNo, invoiceDate } = req.body;

    if (req.user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Admin access required"
      });
    }

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { isInvoiced, invoiceNo, invoiceDate },
      { new: true }
    );

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Invoice status saved",
      order
    });
  } catch (error) {
    console.error("Update invoice status error:", error);
    res.status(500).send({
      success: false,
      message: "Error updating invoice status",
      error: error.message
    });
  }
};

// --- GET ORDER BY ID (BOTH USER & ADMIN) ---
export const getOrderByIdController = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Search by custom orderNumber, not _id
    const order = await orderModel.findOne({ orderNumber: orderId })
      .populate({
        path: "products.product",
        select: "name slug photo"
      })
      .populate("buyer", "name phone email address city state pincode");

    if (!order) {
      return res.status(404).send({ success: false, message: "Order not found" });
    }

    // Security: Only Admin or the Buyer can view
    if (req.user.role !== 1 && order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(401).send({ success: false, message: "Unauthorized" });
    }

    res.status(200).send({ success: true, order });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};
export const getAdminStatsController = async (req, res) => {
  try {
    const userCount = await userModel.countDocuments({});
    const allOrders = await orderModel.find({}, "orderNumber totalPaid status isInvoiced");
    const products = await ProductModel.find({}, "name quantity");

    // Filter logic for specific lists
    const unbilled = allOrders.filter(o => !o.isInvoiced && o.status !== "Cancel");
    const requests = allOrders.filter(o => o.status.includes("Request"));
    const lowStock = products.filter(p => p.quantity < 5);

    res.status(200).send({
      success: true,
      stats: {
        totalRevenue: allOrders.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0),
        orderCount: allOrders.length,
        userCount,
        lowStockItems: lowStock.length,
        notifications: {
          total: unbilled.length + requests.length + lowStock.length,
          // Sending detailed arrays for the sidebar
          unbilledOrders: unbilled.map(o => ({ id: o._id, num: o.orderNumber })),
          requestOrders: requests.map(o => ({ id: o._id, num: o.orderNumber, status: o.status })),
          lowStockItems: lowStock.map(p => ({ name: p.name, qty: p.quantity })),
          requests: requests.length,
          unbilled: unbilled.length,
          lowStock: lowStock.length
        }
      },
    });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};
export default {
  placeOrderController,
  getAllOrdersController,
  getOrdersController,
  orderStatusController,
  updateOrderLogisticsController,
  userOrderStatusController,
  orderInvoiceStatusController,
  getOrderByIdController,
  getAdminStatsController
};