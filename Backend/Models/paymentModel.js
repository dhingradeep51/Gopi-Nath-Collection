import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  merchantTransactionId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // The ID you send to PhonePe
  transactionId: { 
    type: String 
  }, // The ID PhonePe sends back after success
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ["cod", "phonepe"], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["PENDING_PAYMENT", "PAID", "FAILED", "COD"], 
    default: "PENDING_PAYMENT" 
  },
  paymentResponse: { type: Object } // Store raw webhook payload
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
