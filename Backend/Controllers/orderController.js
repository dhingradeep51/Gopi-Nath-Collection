import orderModel from "../Models/orderModel.js";
import moment from "moment";
import ProductModel from "../Models/productModel.js";

// --- PLACE NEW ORDER WITH GST ---
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
      transactionId // For online payments
    } = req.body;

    // 🔒 Validate cart
    if (!cart || cart.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Cart is empty"
      });
    }

    if (!address) {
      return res.status(400).send({
        success: false,
        message: "Shipping address is required"
      });
    }

    // 1️⃣ Validate products and prepare order items WITH GST
    const products = [];
    let calculatedSubtotal = 0;
    let totalBaseAmount = 0;
    let totalGstAmount = 0;
    let highestGstRate = 0; // ✅ Track highest GST rate

    for (const item of cart) {
      // Fetch product to validate stock and get GST rate
      const product = await ProductModel.findById(item._id);

      if (!product) {
        return res.status(404).send({
          success: false,
          message: `Product "${item.name}" not found`
        });
      }

      const requestedQty = item.cartQuantity || 1;

      // Check stock availability
      if (product.quantity < requestedQty) {
        return res.status(400).send({
          success: false,
          message: `Only ${product.quantity} units of "${product.name}" available in stock`
        });
      }

      // ✅ CALCULATE GST BREAKDOWN PER PRODUCT
      const pricePerUnit = product.price; // GST-inclusive price
      const gstPercentage = product.gstRate || 18; // Default to 18% if not set
      const gstDecimal = gstPercentage / 100; // Convert to decimal
      const basePricePerUnit = pricePerUnit / (1 + gstDecimal);
      const gstAmountPerUnit = pricePerUnit - basePricePerUnit;

      const itemSubtotal = pricePerUnit * requestedQty;
      const itemBaseAmount = basePricePerUnit * requestedQty;
      const itemGstAmount = gstAmountPerUnit * requestedQty;

      calculatedSubtotal += itemSubtotal;
      totalBaseAmount += itemBaseAmount;
      totalGstAmount += itemGstAmount;

      // ✅ Track highest GST rate in cart
      if (gstPercentage > highestGstRate) {
        highestGstRate = gstPercentage;
      }

      products.push({
        product: product._id,
        name: product.name,
        qty: requestedQty,
        price: Number(pricePerUnit.toFixed(2)),
        gstRate: gstPercentage, // Store as percentage
        basePrice: Number(basePricePerUnit.toFixed(2)),
        gstAmount: Number(gstAmountPerUnit.toFixed(2))
      });
    }

    // 2️⃣ Calculate final payable amount
    const finalSubtotal = subtotal || calculatedSubtotal;
    const totalPaid = totalAmount || (finalSubtotal + shippingFee - discount);

    if (totalPaid <= 0) {
      return res.status(400).send({
        success: false,
        message: "Invalid order amount"
      });
    }

    // 3️⃣ Generate Order Number (GN-YYYYMMDD-XXX)
    const datePart = moment().format("YYYYMMDD");
    const todayCount = await orderModel.countDocuments({
      orderNumber: { $regex: `^GN-${datePart}` }
    });
    const sequence = String(todayCount + 1).padStart(3, "0");
    const generatedOrderNumber = `GN-${datePart}-${sequence}`;

    // 4️⃣ Save Order WITH GST
    const order = await orderModel.create({
      products,
      buyer: req.user._id,
      address,

      payment: {
        success: paymentMethod === "online" ? true : false,
        method: paymentMethod,
        transactionId: paymentMethod === "online" ? transactionId : null,
        paidAt: paymentMethod === "online" ? new Date() : null
      },

      orderNumber: generatedOrderNumber,

      subtotal: Number(finalSubtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      shippingFee: Number(shippingFee.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      
      // ✅ GST TOTALS
      totalBaseAmount: Number(totalBaseAmount.toFixed(2)),
      totalGstAmount: Number(totalGstAmount.toFixed(2)),
      highestGstRate: highestGstRate, // ✅ Store highest GST rate

      status: "Not Processed"
    });

    // 5️⃣ Reduce product stock
    for (const item of products) {
      await ProductModel.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.qty } }
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
      message: "Error placing order",
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
    const { status, reason } = req.body;
    
    // Validate required fields
    if (!status) {
      return res.status(400).send({ 
        success: false, 
        message: "Status is required" 
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).send({ 
        success: false, 
        message: "Reason is required" 
      });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).send({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Check if user owns this order
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(401).send({ 
        success: false, 
        message: "Unauthorized access" 
      });
    }

    // Validate cancel conditions
    if (status === "Cancel") {
      const cancellableStatuses = ["Not Processed", "Processing"];
      if (!cancellableStatuses.includes(order.status)) {
        return res.status(400).send({ 
          success: false, 
          message: `Cannot cancel order with status: ${order.status}. Only orders with status 'Not Processed' or 'Processing' can be cancelled.` 
        });
      }
    }

    // Validate return conditions
    if (status === "Return") {
      if (order.status !== "Delivered") {
        return res.status(400).send({ 
          success: false, 
          message: "Can only return delivered orders" 
        });
      }

      // Check if return is within 7 days of delivery
      const deliveryDate = new Date(order.updatedAt);
      const currentDate = new Date();
      const daysSinceDelivery = Math.floor((currentDate - deliveryDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceDelivery > 7) {
        return res.status(400).send({ 
          success: false, 
          message: "Return period has expired. Returns are only accepted within 7 days of delivery." 
        });
      }
    }

    // Prepare update data
    const updateData = {
      status,
      cancelReason: status === "Cancel" ? reason.trim() : order.cancelReason,
      returnReason: status === "Return" ? reason.trim() : order.returnReason,
      updatedAt: Date.now()
    };

    // Update order with reason
    const updated = await orderModel.findByIdAndUpdate(
      orderId, 
      updateData, 
      { new: true }
    );

    // If canceling, restore stock to inventory
    if (status === "Cancel") {
      for (const item of order.products) {
        await ProductModel.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: item.qty } }
        );
      }
      
      console.log(`Order ${orderId} cancelled. Stock restored for ${order.products.length} items.`);
    }

    // If returning, you might want to handle stock differently
    // Uncomment if you want to restore stock on returns as well
    // if (status === "Return") {
    //   for (const item of order.products) {
    //     await ProductModel.findByIdAndUpdate(
    //       item.product,
    //       { $inc: { quantity: item.qty } }
    //     );
    //   }
    //   console.log(`Order ${orderId} returned. Stock restored for ${order.products.length} items.`);
    // }

    res.status(200).send({ 
      success: true, 
      message: status === "Cancel" 
        ? "Order cancelled successfully" 
        : "Return request submitted successfully", 
      order: updated 
    });

  } catch (error) {
    console.error("User order status error:", error);
    res.status(500).send({ 
      success: false, 
      message: "Error updating order status",
      error: error.message 
    });
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
export default {
  placeOrderController,
  getAllOrdersController,
  getOrdersController,
  orderStatusController,
  updateOrderLogisticsController,
  userOrderStatusController,
  orderInvoiceStatusController,
  getOrderByIdController
};