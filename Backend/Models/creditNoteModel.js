import mongoose from "mongoose";

const creditNoteItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    qty: Number,

    taxableValue: Number,
    cgst: Number,
    sgst: Number,
    igst: Number
  },
  { _id: false }
);

const creditNoteSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true
    },

    creditNoteNumber: {
      type: String,
      required: true,
      unique: true
    },

    creditNoteDate: {
      type: Date,
      default: Date.now
    },

    reason: {
      type: String,
      enum: ["CANCELLED", "RETURNED"],
      required: true
    },

    taxableValue: Number,
    cgst: Number,
    sgst: Number,
    igst: Number,
    totalCredit: Number,

    items: [creditNoteItemSchema],

    pdfPath: String
  },
  { timestamps: true }
);

export default mongoose.model("CreditNote", creditNoteSchema);
