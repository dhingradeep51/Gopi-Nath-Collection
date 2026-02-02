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
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order" 
  },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["PENDING", "SUCCESS", "FAILED"], 
    default: "PENDING" 
  },
  paymentResponse: { type: Object } // Store raw data for security audits
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);