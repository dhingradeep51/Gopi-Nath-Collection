import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    productName: String,
    qty: Number,
    unitPrice: Number,     // Original inclusive price
    finalPrice: Number,    // After discount/shipping adjustments
    taxableValue: Number,
    cgst: Number,
    sgst: Number,
    igst: Number
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },
    orderNumber: {
      type: String,
      required: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },

    // ✅ NEW SELLER FIELDS
    sellerName: { type: String, default: "Gopi Nath Collection" },
    sellerGstin: { type: String }, 
    sellerAddress: { type: String },
    sellerState: { type: String, default: "Haryana" },

    // ✅ NEW BUYER FIELDS (Populated from User Address Object)
    buyerName: { type: String },
    buyerAddress: { type: String }, // Formatted string from nested user address
    buyerState: { type: String },
    placeOfSupply: { type: String },

    paymentMethod: {
      type: String,
      enum: ["PREPAID", "COD"]
    },

    // Financials
    subtotal: Number,
    discount: Number,
    shippingCharges: Number,
    taxableValue: Number,
    cgst: Number,
    sgst: Number,
    igst: Number,
    totalPaid: Number,

    gstType: {
      type: String,
      enum: ["CGST_SGST", "IGST", "GST_EXEMPT"]
    },

    items: [invoiceItemSchema],
    pdfPath: String
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);