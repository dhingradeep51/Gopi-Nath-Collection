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

    // Validation
    if (!name || !expiry || !discountType || !discountValue) {
      return res.status(400).send({
        success: false,
        message: "Required fields: name, expiry, discountType, discountValue",
      });
    }

    // Validate discount type
    if (!["fixed", "percentage", "gift"].includes(discountType)) {
      return res.status(400).send({
        success: false,
        message: "Invalid discount type. Must be: fixed, percentage, or gift",
      });
    }

    // Validate percentage value
    if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).send({
        success: false,
        message: "Percentage discount must be between 0 and 100",
      });
    }

    // Validate gift product exists
    if (discountType === "gift") {
      if (!giftProductId) {
        return res.status(400).send({
          success: false,
          message: "Gift product is required for gift type coupons",
        });
      }
      const productExists = await Product.findById(giftProductId);
      if (!productExists) {
        return res.status(400).send({
          success: false,
          message: "Selected gift product does not exist",
        });
      }
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCoupon) {
      return res.status(400).send({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // Create coupon
    const coupon = await new Coupon({
      name: name.toUpperCase(),
      expiry,
      discountType,
      discountValue,
      maxDiscount: discountType === "percentage" ? maxDiscount || 0 : 0,
      minPurchase: minPurchase || 0,
      usageLimit: usageLimit || 1,
      usedCount: 0,
      giftProductId: discountType === "gift" ? giftProductId : null,
    }).save();

    res.status(201).send({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).send({
      success: false,
      message: "Error creating coupon",
      error: error.message,
    });
  }
};

// ==================== GET ALL COUPONS ====================
export const getCouponsController = async (req, res) => {
  try {
    const coupons = await Coupon.find({})
      .populate("giftProductId", "name price") // Populate gift product details
      .sort({ createdAt: -1 });

    res.status(200).send(coupons);
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
export const incrementCouponUsageController = async (req, res) => {
  try {
    const { couponId } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).send({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Coupon usage updated",
      coupon,
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