import OrderModel from "../Models/orderModel.js";
import moment from "moment";
import ProductModel from "../Models/productModel.js";
import PaymentModel from "../Models/paymentModel.js";
import userModel from "../Models/userModel.js";
// ✅ Ensure the import path and filename match your utils folder exactly
import { sendNotification } from "../Utils/notificationUtils.js";
import { MetaInfo, CreateSdkOrderRequest, StandardCheckoutClient } from "pg-sdk-node";
import phonePeClient from "../Utils/phonepeClient.js";

/**
 * 🚀 PLACE ORDER CONTROLLER (PURE V2)
 */
export const placeOrderController = async (req, res) => {
  try {
    const { cart, address, paymentMethod } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Cart is empty"
      });
    }

    let products = [];
    let subtotal = 0;
    let totalBaseAmount = 0;
    let totalGstAmount = 0;
    let highestGstRate = 0;

    // 1️⃣ Prepare product snapshot + GST
    for (const item of cart) {
      const product = await ProductModel.findById(item._id);
      if (!product) continue;

      const qty = item.cartQuantity || 1;
      const price = product.price;
      const gstRate = product.gstRate || 18;

      const basePrice = price / (1 + gstRate / 100);
      const gstAmount = price - basePrice;

      subtotal += price * qty;
      totalBaseAmount += basePrice * qty;
      totalGstAmount += gstAmount * qty;
      highestGstRate = Math.max(highestGstRate, gstRate);

      products.push({
        product: product._id,
        name: product.name,
        qty,
        price,
        gstRate,
        basePrice,
        gstAmount
      });
    }

    const totalPaid = Number(subtotal.toFixed(2));
    const merchantOrderId = `ORD${Date.now()}`;
    const orderNumber = `GN-${moment().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)}`;

    // 2️⃣ Create Payment FIRST (before Order)
    const paymentStatus = paymentMethod === "cod" ? "COD" : "PENDING_PAYMENT";
    const payment = await new PaymentModel({
      merchantTransactionId: merchantOrderId,
      amount: totalPaid,
      method: paymentMethod === "cod" ? "cod" : "phonepe",
      status: paymentStatus
    }).save();

    // Guard: Ensure payment was created successfully
    if (!payment || !payment._id) {
      return res.status(500).send({
        success: false,
        message: "Failed to create payment record"
      });
    }

    // 3️⃣ Create Order with paymentDetails
    const order = await OrderModel.create({
      merchantOrderId,
      orderNumber,
      products,
      buyer: req.user._id,
      address,
      subtotal: totalPaid,
      totalPaid,
      totalBaseAmount,
      totalGstAmount,
      highestGstRate,
      status: paymentMethod === "cod" ? "Processing" : "Not Processed",
      paymentDetails: payment._id // Always include this
    });

    // 4️⃣ COD FLOW - Already handled in Payment creation above
    if (paymentMethod === "cod") {
      return res.status(201).send({
        success: true,
        message: "Order placed with Cash on Delivery",
        order
      });
    }

    // 5️⃣ PHONEPE V2 CHECKOUT
    const metaInfo = MetaInfo.builder()
      .udf1(req.user._id.toString())
      .udf2(orderNumber)
      .build();

    const sdkOrder = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantOrderId)
      .amount(Math.round(totalPaid * 100)) // paise
      .metaInfo(metaInfo)
      .redirectUrl(`${process.env.BACKEND_URL}/api/v1/payment/phonepe/redirect?orderNumber=${orderNumber}`)
      .build();

    const phonePeResponse = await phonePeClient.pay(sdkOrder);

    return res.status(200).send({
      success: true,
      redirectUrl: phonePeResponse.redirectUrl,
      orderId: order._id
    });

  } catch (error) {
    console.error("Place Order Error:", error);
    return res.status(500).send({
      success: false,
      message: "Order placement failed"
    });
  }
};

/**
 * 📦 GET USER ORDERS
 */
export const getUserOrdersController = async (req, res) => {
  try {
    const orders = await OrderModel.find({ buyer: req.user._id })
      .populate("products.product", "name photo")
      .sort({ createdAt: -1 });

    res.status(200).send({ success: true, orders });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to fetch orders"
    });
  }
};

/**
 * 🧾 GET SINGLE ORDER BY ORDER NUMBER
 */
export const getOrderByOrderNumberController = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await OrderModel.findOne({ orderNumber })
      .populate("paymentDetails");

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).send({
      success: true,
      order
    });

  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).send({
      success: false,
      message: "Server error"
    });
  }
};



export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await OrderModel.find({})
      .populate({
        path: "products.product",
        select: "name slug photo",
      })
      .populate("buyer", "name phone email state address")
      // ✅ POPULATE PAYMENT STATUS
      .populate({
        path: "paymentDetails",
        select: "status method merchantTransactionId" 
      })
      .select("orderNumber products buyer status paymentDetails isInvoiced invoiceNo createdAt cancelReason returnReason isApprovedByAdmin")
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

    const updated = await OrderModel.findByIdAndUpdate(orderId, updateData, { new: true }).populate("buyer", "name");

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

    const updatedOrder = await OrderModel.findByIdAndUpdate(
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

    const order = await OrderModel.findById(orderId);
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

    const updated = await OrderModel.findByIdAndUpdate(orderId, {
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
    const orders = await OrderModel.find({ buyer: req.user._id })
      .populate({
        path: "products.product",
        select: "name photo"
      })
      // ✅ POPULATE PAYMENT STATUS
      .populate({
        path: "paymentDetails",
        select: "status method"
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

    const order = await OrderModel.findByIdAndUpdate(
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
    const order = await OrderModel.findOne({ orderNumber: orderId })
      .populate({
        path: "products.product",
        select: "name slug photo"
      })
      .populate("buyer", "name phone email address city state pincode")
      .populate({
        path: "paymentDetails",
        select: "status method transactionId merchantTransactionId amount"
      });

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
    const allOrders = await OrderModel.find({}, "orderNumber totalPaid status isInvoiced");
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