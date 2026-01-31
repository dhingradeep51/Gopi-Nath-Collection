import orderModel from "../Models/orderModel.js";
import moment from "moment";
import ProductModel from "../Models/productModel.js";
import userModel from "../Models/userModel.js";

// --- PLACE NEW ORDER WITH GST & GIFT LOGIC ---
export const placeOrderController = async (req, res) => {
  try {
    const {
      cart,
      address,
      paymentMethod,
      shippingFee = 0,
      discount = 0,
      subtotal,
      totalAmount,
      transactionId,
      // Gift specific fields from frontend CheckOutPage
      couponType,
      giftProductId 
    } = req.body;

    // 1️⃣ Validate core requirements
    if (!cart || cart.length === 0) {
      return res.status(400).send({ success: false, message: "Cart is empty" });
    }
    if (!address) {
      return res.status(400).send({ success: false, message: "Shipping address is required" });
    }

    const products = [];
    let calculatedSubtotal = 0;
    let totalBaseAmount = 0;
    let totalGstAmount = 0;
    let highestGstRate = 0;

    // 2️⃣ Process Cart Items (With GST Calculations)
    for (const item of cart) {
      const product = await ProductModel.findById(item._id);

      if (!product) {
        return res.status(404).send({ 
            success: false, 
            message: `Product "${item.name}" not found` 
        });
      }

      const requestedQty = item.cartQuantity || 1;

      // Stock check
      if (product.quantity < requestedQty) {
        return res.status(400).send({
          success: false,
          message: `Only ${product.quantity} units of "${product.name}" available`
        });
      }

      // ✅ GST Calculation Logic (Inclusive to Exclusive)
      const pricePerUnit = product.price; // Tax-inclusive price
      const gstPercentage = product.gstRate || 18; 
      const gstDecimal = gstPercentage / 100;
      const basePricePerUnit = pricePerUnit / (1 + gstDecimal);
      const gstAmountPerUnit = pricePerUnit - basePricePerUnit;

      const itemSubtotal = pricePerUnit * requestedQty;
      const itemBaseAmount = basePricePerUnit * requestedQty;
      const itemGstAmount = gstAmountPerUnit * requestedQty;

      calculatedSubtotal += itemSubtotal;
      totalBaseAmount += itemBaseAmount;
      totalGstAmount += itemGstAmount;

      if (gstPercentage > highestGstRate) {
        highestGstRate = gstPercentage;
      }

      products.push({
        product: product._id,
        name: product.name,
        qty: requestedQty,
        price: Number(pricePerUnit.toFixed(2)),
        gstRate: gstPercentage,
        basePrice: Number(basePricePerUnit.toFixed(2)),
        gstAmount: Number(gstAmountPerUnit.toFixed(2))
      });
    }

    // 3️⃣ ✅ GIFT INJECTION LOGIC
    // If the applied coupon is a "gift" type, we add the product to the order at ₹0
    if (couponType === "gift" && giftProductId) {
      const giftItem = await ProductModel.findById(giftProductId);
      
      if (giftItem) {
        // Ensure gift is in stock
        if (giftItem.quantity > 0) {
          products.push({
            product: giftItem._id,
            name: `🎁 GIFT: ${giftItem.name}`,
            qty: 1,
            price: 0, // Gift is free of charge
            gstRate: 0,
            basePrice: 0,
            gstAmount: 0
          });
          
          // Deduct stock for the gift item specifically
          await ProductModel.findByIdAndUpdate(giftItem._id, { $inc: { quantity: -1 } });
        } else {
            console.log("Gift item out of stock, skipping injection.");
        }
      }
    }

    // 4️⃣ Final Totals Calculation
    const finalSubtotal = subtotal || calculatedSubtotal;
    const totalPaid = totalAmount || (finalSubtotal + shippingFee - discount);

    if (totalPaid < 0) {
      return res.status(400).send({ success: false, message: "Invalid order amount" });
    }

    // 5️⃣ Generate Order Number (GN-YYYYMMDD-XXX)
    const datePart = moment().format("YYYYMMDD");
    const todayCount = await orderModel.countDocuments({
      orderNumber: { $regex: `^GN-${datePart}` }
    });
    const sequence = String(todayCount + 1).padStart(3, "0");
    const generatedOrderNumber = `GN-${datePart}-${sequence}`;

    // 6️⃣ Save Order to Database
    const order = await orderModel.create({
      products,
      buyer: req.user._id,
      address,
      payment: {
        success: paymentMethod === "cod" ? false : true,
        method: paymentMethod,
        transactionId: transactionId || null,
        paidAt: paymentMethod === "cod" ? null : new Date()
      },
      orderNumber: generatedOrderNumber,
      subtotal: Number(finalSubtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      shippingFee: Number(shippingFee.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalBaseAmount: Number(totalBaseAmount.toFixed(2)),
      totalGstAmount: Number(totalGstAmount.toFixed(2)),
      highestGstRate: highestGstRate,
      status: "Not Processed"
    });

    // 7️⃣ Final Stock Reduction for Cart Items
    for (const item of cart) {
      await ProductModel.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -(item.cartQuantity || 1) } }
      );
    }

    return res.status(201).send({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).send({
      success: false,
      message: "Error processing your divine order",
      error: error.message
    });
  }
};

// --- GET ALL ORDERS (ADMIN REGISTRY) ---
// --- GET ALL ORDERS (ADMIN REGISTRY) ---
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

    // Security Check: Ensure only Admin can access
    if (req.user.role !== 1) {
      return res.status(401).send({ 
        success: false, 
        message: "Admin access required" 
      });
    }

    // ✅ PREPARE UPDATE DATA: Include the approval flag for Cancel/Return
    const updateData = { status };
    
    if (status === "Cancel" || status === "Return") {
      updateData.isApprovedByAdmin = true;
    }

    const updated = await orderModel.findByIdAndUpdate(
      orderId,
      updateData, // Apply the flag update here
      { new: true }
    ).populate("buyer", "name");

    if (!updated) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).send({ 
      success: true, 
      message: `Order marked as ${status} and approved`, 
      updated 
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).send({ 
      success: false, 
      message: "Error updating status", 
      error: error.message 
    });
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
    const { status, reason } = req.body; // status will be "Cancel" or "Return"
    
    if (!status || !reason || !reason.trim()) {
      return res.status(400).send({ success: false, message: "Status and Reason are required" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).send({ success: false, message: "Order not found" });

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(401).send({ success: false, message: "Unauthorized access" });
    }

    // ✅ Map to "Request" statuses instead of finalized statuses
    let newStatus;
    if (status === "Cancel") {
      const cancellableStatuses = ["Not Processed", "Processing"];
      if (!cancellableStatuses.includes(order.status)) {
        return res.status(400).send({ success: false, message: "Order cannot be cancelled at this stage" });
      }
      newStatus = "Cancel Request";
    } else if (status === "Return") {
      if (order.status !== "Delivered") {
        return res.status(400).send({ success: false, message: "Can only return delivered orders" });
      }
      // Check 7-day window
      const deliveryDate = new Date(order.updatedAt);
      const daysSinceDelivery = Math.floor((new Date() - deliveryDate) / (1000 * 60 * 60 * 24));
      if (daysSinceDelivery > 7) {
        return res.status(400).send({ success: false, message: "Return period has expired" });
      }
      newStatus = "Return Request";
    }

    // ✅ Update with the Request status and reset Admin Approval flag
    const updateData = {
      status: newStatus,
      cancelReason: status === "Cancel" ? reason.trim() : order.cancelReason,
      returnReason: status === "Return" ? reason.trim() : order.returnReason,
      isApprovedByAdmin: false, // Ensures the Approve button shows for Admin
      updatedAt: Date.now()
    };

    const updated = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true });

    // 🛑 Note: Stock restoration logic is removed from here. 
    // It must be triggered in orderStatusController when Admin clicks "Approve".

    res.status(200).send({ 
      success: true, 
      message: `${status} request submitted. Our team is reviewing it.`, 
      order: updated 
    });

  } catch (error) {
    console.error("User order status error:", error);
    res.status(500).send({ success: false, message: "Error updating request", error: error.message });
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
    const allOrders = await orderModel.find({}, "totalPaid status isInvoiced");
    const products = await ProductModel.find({}, "quantity");
    
    const totalRevenue = allOrders.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
    const lowStockItems = products.filter(p => p.quantity < 5).length;

    // ✅ NOTIFICATION LOGIC
    // 1. Return/Cancel Requests
    const orderRequests = allOrders.filter(o => o.status.includes("Request")).length;
    // 2. Unbilled Orders (Not yet Invoiced)
    const unbilledOrders = allOrders.filter(o => !o.isInvoiced && o.status !== "Cancel").length;
    // 3. Total Notifications
    const totalNotifications = orderRequests + unbilledOrders + (lowStockItems > 0 ? 1 : 0);

    res.status(200).send({
      success: true,
      stats: {
        totalRevenue,
        orderCount: allOrders.length,
        userCount,
        lowStockItems,
        notifications: {
          total: totalNotifications,
          requests: orderRequests,
          unbilled: unbilledOrders,
          lowStock: lowStockItems
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