// ========================================
// PRODUCT MODEL - productModel.js
// ========================================
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    attachment: { type: String, default: "" }, 
  },
  { timestamps: true } 
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String },
    description: { type: String, required: true },
    
    // ✅ PRICING & TAX
    price: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, enum: [0, 5, 12, 18], default: 18 },

    category: { type: mongoose.ObjectId, ref: "Category", required: true },
    quantity: { type: Number, required: true, min: 0 },

    // ✅ MULTIPLE PHOTOS
    // Storing as an array of objects to handle both Buffer data or URL strings
    photos: [
      {
        data: Buffer,
        contentType: String,
        url: String // Optional: if you decide to use Cloudinary/S3 later
      }
    ],

    // ✅ SPECIFICATIONS (Size, Color, etc.)
    specifications: {
      colors: [{ type: String }], // e.g., ["Red", "Blue"]
      sizes: [{ type: String }],  // e.g., ["S", "M", "L", "XL"]
      material: { type: String },
      weight: { type: String },
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, default: "cm" }
      },
      additionalDetails: [
        {
          key: String,   // e.g., "Battery Life"
          value: String  // e.g., "20 Hours"
        }
      ]
    },

    shipping: { type: Boolean, default: false },
    productID: { type: String, unique: true, required: true },

    // ✅ REVIEWS & RATINGS
    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export default mongoose.model("Products", productSchema);