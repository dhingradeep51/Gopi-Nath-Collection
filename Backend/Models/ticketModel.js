import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    // Link to your "User" model
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", // This must match the name in your export
        required: true 
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    attachment: { type: String }, 
    status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
    replies: [{ adminMessage: String, date: { type: Date, default: Date.now } }]
}, { timestamps: true });

export default mongoose.model("Tickets", ticketSchema);