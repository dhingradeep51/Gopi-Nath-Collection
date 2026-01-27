// ========================================
// PRODUCT MODEL - productModel.js
// ========================================
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5
    },
    comment: { 
      type: String, 
      required: true 
    },
    attachment: { 
      type: String,
      default: ""
    }, 
  },
  { timestamps: true } 
);

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true 
    },
    shortDescription: { 
      type: String 
    },
    description: { 
      type: String, 
      required: true 
    },

    // ✅ GST-INCLUSIVE PRICE
    price: { 
      type: Number, 
      required: true,
      min: 0
    },

    // ✅ GST RATE AS PERCENTAGE (5%, 12%, 18%)
    gstRate: {
      type: Number,
      enum: [0, 5, 12, 18], // ✅ Changed to percentages
      default: 18
    },

    category: { 
      type: mongoose.ObjectId, 
      ref: "Category", 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 0
    },

    photo: { 
      data: Buffer, 
      contentType: String 
    },
    shipping: { 
      type: Boolean,
      default: false
    },

    productID: { 
      type: String, 
      unique: true, 
      required: true 
    },

    reviews: [reviewSchema],
    numReviews: { 
      type: Number, 
      default: 0 
    },
    averageRating: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
  },
  { timestamps: true }
);

// ✅ VIRTUAL FIELDS FOR GST CALCULATIONS

export default mongoose.model("Products", productSchema);