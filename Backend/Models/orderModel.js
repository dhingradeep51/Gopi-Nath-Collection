import mongoose from "mongoose";

// ✅ ORDER PRODUCT SCHEMA WITH GST
const orderProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    // ✅ GST FIELDS PER PRODUCT (stored as percentage)
    gstRate: {
      type: Number,
      required: true,
      enum: [0, 5, 12, 18] // Store as percentage: 0%, 5%, 12%, 18%
    },
    basePrice: {
      type: Number,
      required: true
    },
    gstAmount: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // 🛒 PRODUCTS SNAPSHOT WITH GST
    products: [orderProductSchema],

    // 💳 PAYMENT INFO
    payment: {
      method: {
        type: String,
        enum: ["cod", "online"],
        default: "cod"
      },
      transactionId: { type: String },
      paidAt: { type: Date }
    },

    // 👤 BUYER
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 📦 ORDER STATUS
    status: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancel Requested",
        "Cancel",
        "Return Request",
        "Return",

      ]
    },

    // 🔢 BUSINESS IDENTIFIERS
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },

    // 🏠 SHIPPING
    address: {
      type: String,
      required: true
    },
    awbNumber: { type: String, default: "" },
    trackingLink: { type: String, default: "" },

    // 💰 FINANCIALS
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      required: true
    },
    
    // ✅ GST TOTALS FOR ENTIRE ORDER
    totalBaseAmount: {
      type: Number,
      required: true
    },
    totalGstAmount: {
      type: Number,
      required: true
    },
    // ✅ HIGHEST GST RATE IN ORDER (for invoice)
    highestGstRate: {
      type: Number,
      required: true,
      enum: [0, 5, 12, 18]
    },

    // 🧾 INVOICE TRACKING
    isInvoiced: {
      type: Boolean,
      default: false
    },
    invoiceNo: {
      type: String,
      unique: true,
      sparse: true
    },
    invoiceDate: {
      type: Date
    },

    isApprovedByAdmin: {
      type: Boolean,
      default: false,
    },

    // 🚫 CANCEL/RETURN REASONS
    cancelReason: {
      type: String,
      default: null
    },
    returnReason: {
      type: String,
      default: null
    },
    // 💳 PAYMENT REFERENCE (Link to your separate model)
    paymentDetails:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true // Must match your Payment model name
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);