import Coupon from "../Models/couponModel.js";
import Product from "../Models/productModel.js"; // Import Product model for gift validation

// ==================== CREATE COUPON ====================
export const createCouponController = async (req, res) => {
  try {
    const {
      name,
      expiry,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      usageLimit,
      giftProductId,
    } = req.body;

    // 1. Updated Conditional Validation
    const isGift = discountType === "gift";
    if (!name || !expiry || !discountType || (!isGift && !discountValue)) {
      return res.status(400).send({
        success: false,
        message: "Required fields missing: name, expiry, or discount value",
      });
    }

    // 2. Validate gift product if applicable
    if (isGift) {
      if (!giftProductId) {
        return res.status(400).send({
          success: false,
          message: "Please select a product to offer as a gift",
        });
      }
      const productExists = await Product.findById(giftProductId);
      if (!productExists) {
        return res.status(400).send({
          success: false,
          message: "The selected gift product no longer exists",
        });
      }
    }

    // 3. Check for existing coupon (Case Insensitive)
    const existingCoupon = await Coupon.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCoupon) {
      return res.status(400).send({
        success: false,
        message: "This coupon code already exists",
      });
    }

    // 4. Create and Save
    const coupon = await new Coupon({
      name: name.toUpperCase(),
      expiry,
      discountType,
      // Force 0 for gifts so the 'required' field in Schema is satisfied
      discountValue: isGift ? 0 : discountValue, 
      maxDiscount: discountType === "percentage" ? maxDiscount || 0 : 0,
      minPurchase: minPurchase || 0,
      usageLimit: usageLimit || 1,
      usedCount: 0,
      giftProductId: isGift ? giftProductId : null,
    }).save();

    res.status(201).send({
      success: true,
      message: "Divine Coupon Created Successfully",
      coupon,
    });
  } catch (error) {
    console.error("Creation Error:", error);
    res.status(500).send({
      success: false,
      message: "Server error while creating coupon",
      error: error.message,
    });
  }
};

// ==================== GET ALL COUPONS ====================
// ==================== GET ALL COUPONS ====================
export const getCouponsController = async (req, res) => {
  try {
    const coupons = await Coupon.find({})
      .populate("giftProductId", "name price")
      .sort({ createdAt: -1 });

    // Send as an object so frontend can check data.success
    res.status(200).send({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching coupons",
      error: error.message,
    });
  }
};

// ==================== DELETE COUPON ====================
export const deleteCouponController = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).send({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting coupon",
      error: error.message,
    });
  }
};

// ==================== GET SINGLE COUPON (VALIDATION) ====================
export const getSingleCouponController = async (req, res) => {
  try {
    const { name } = req.params;
    const { orderTotal } = req.query; // Get order total from query params

    console.log(`Validating coupon: ${name}`);

    // Find coupon (case-insensitive)
    const coupon = await Coupon.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    }).populate("giftProductId", "name price _id");

    if (!coupon) {
      console.log(`❌ Coupon not found: ${name}`);
      return res.status(404).send({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check if expired
    const now = new Date();
    const expiryDate = new Date(coupon.expiry);

    if (expiryDate < now) {
      console.log(`⚠️ Coupon expired: ${name}`);
      return res.status(400).send({
        success: false,
        message: "This coupon has expired",
      });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      console.log(`⚠️ Coupon usage limit reached: ${name}`);
      return res.status(400).send({
        success: false,
        message: "This coupon has reached its usage limit",
      });
    }

    // Check minimum purchase requirement
    if (orderTotal && parseFloat(orderTotal) < coupon.minPurchase) {
      console.log(`⚠️ Minimum purchase not met for coupon: ${name}`);
      return res.status(400).send({
        success: false,
        message: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon`,
      });
    }

    // Calculate discount based on type
    let calculatedDiscount = 0;

    if (coupon.discountType === "fixed") {
      calculatedDiscount = coupon.discountValue;
    } else if (coupon.discountType === "percentage" && orderTotal) {
      calculatedDiscount = (parseFloat(orderTotal) * coupon.discountValue) / 100;
      // Apply max discount cap if set
      if (coupon.maxDiscount > 0 && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    }

    console.log(`✅ Coupon validated: ${name} (Discount: ₹${calculatedDiscount})`);

    res.status(200).send({
      success: true,
      coupon: {
        ...coupon.toObject(),
        calculatedDiscount, // Send calculated discount
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).send({
      success: false,
      message: "Server error during validation",
      error: error.message,
    });
  }
};

// ==================== INCREMENT USAGE COUNT ====================
// ==================== INCREMENT USAGE COUNT ====================
export const incrementCouponUsageController = async (req, res) => {
  try {
    const { couponId } = req.body;

    // 1️⃣ Find the coupon first to check limits
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(404).send({
        success: false,
        message: "Coupon not found",
      });
    }

    // 2️⃣ ✅ Safety Check: Prevent incrementing if limit is already reached
    // This is crucial for Gift Coupons so you don't give away more items than planned
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).send({
        success: false,
        message: "Coupon usage limit has already been reached",
      });
    }

    // 3️⃣ Increment usage count
    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).send({
      success: true,
      message: "Coupon usage updated successfully",
      usedCount: coupon.usedCount,
      remaining: coupon.usageLimit - coupon.usedCount
    });
  } catch (error) {
    console.error("Error incrementing coupon usage:", error);
    res.status(500).send({
      success: false,
      message: "Error updating coupon usage",
      error: error.message,
    });
  }
};