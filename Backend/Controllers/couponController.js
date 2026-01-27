import Coupon from "../Models/couponModel.js";

// 1. CREATE COUPON
export const createCouponController = async (req, res) => {
  try {
    const { name, expiry, discount } = req.body;
    if (!name || !expiry || !discount) {
      return res.status(400).send({ message: "All fields are required" });
    }
    const coupon = await new Coupon({ name, expiry, discount }).save();
    res.status(201).send({
      success: true,
      message: "New coupon added to registry",
      coupon,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error in creation", error });
  }
};

// 2. GET ALL COUPONS (ADMIN)
export const getCouponsController = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).send(coupons);
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching registry" });
  }
};

// 3. DELETE COUPON
export const deleteCouponController = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      message: "Coupon removed from registry successfully",
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error in deletion" });
  }
};

// GET SINGLE COUPON (FOR CHECKOUT VALIDATION)
export const getSingleCouponController = async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`Checking coupon registry for: ${name}`); // ✅ Console Log added

    // Search case-insensitive
    const coupon = await Coupon.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, "i") } 
    });

    if (!coupon) {
      console.log(`❌ Coupon Not Found: ${name}`); // ✅ Console Log added
      // ✅ Removed 200, using 404 for invalid codes
      return res.status(404).send({
        success: false,
        message: "This coupon code does not exist in our registry.",
      });
    }

    // Check Expiry
    const now = new Date();
    const expiryDate = new Date(coupon.expiry);

    if (expiryDate < now) {
      console.log(`⚠️ Coupon Expired: ${name} (Expired on ${coupon.expiry})`); // ✅ Console Log added
      // ✅ Removed 200, using 400 for expired codes
      return res.status(400).send({
        success: false,
        message: "This divine discount has expired.",
      });
    }

    console.log(`✅ Coupon Validated: ${name} (Discount: ₹${coupon.discount})`); // ✅ Console Log added
    res.status(200).send({
      success: true,
      coupon,
    });
  } catch (error) {
    console.log("CRITICAL ERROR IN COUPON VALIDATION:", error.message); // ✅ Console Log added
    res.status(500).send({ 
      success: false, 
      message: "Server error during validation",
      error: error.message 
    });
  }
};