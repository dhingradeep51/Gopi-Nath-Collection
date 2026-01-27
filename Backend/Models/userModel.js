import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
    },

    passwordHistory: {
      type: [String],
      default: [],
    },

    phone: {
      type: String,
      required: true,
    },

    // ✅ UPDATED: Address as OBJECT (Invoice & GST friendly)
    address: {
      fullAddress: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },

    // Optional internal ID
    customId: {
      type: String,
      unique: true,
      sparse: true,
    },

    orderCount: {
      type: Number,
      default: 0,
    },

    role: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Disabled"],
      default: "Active",
    },

    passwordChangeCount: {
      type: Number,
      default: 0,
    },

    otp: {
      type: String,
    },

    otpExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
