import UserModel from "../Models/userModel.js";
import { hashPassword, comparePassword } from "../Helpers/authHelper.js";
import nodemailer from "nodemailer";
import JWT from "jsonwebtoken";
import axios from "axios"; // ✅ Ensure axios is installed: npm install axios

// Ensure path is correct

export const sendOTPController = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    // 1. Validation
    if (!email || !purpose) {
      return res.status(400).send({
        success: false,
        message: "Email and purpose are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes

    // 2. Database Operation with Timeout/Error Handling
    try {
      await UserModel.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: { email: normalizedEmail, otp, otpExpires },
          $setOnInsert: {
            name: "Pending",
            phone: "0000000000",
            address: { 
              fullAddress: "Pending", 
              city: "Pending", 
              state: "Pending", 
              pincode: "000000" 
            },
            status: "Active",
          },
        },
        { upsert: true, new: true, maxTimeMS: 5000 } // Fail if DB takes > 5s
      );
    } catch (dbError) {
      console.error("Database Error:", dbError.message);
      return res.status(500).send({
        success: false,
        message: "Database connection busy. Please try again.",
      });
    }

    // 3. Email Template
    const htmlContent = `
      <div style="font-family: serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; padding: 40px; background-color: #2D0A14; color: white; text-align: center;">
        <h1 style="color: #D4AF37;">GOPI NATH COLLECTION</h1>
        <h2 style="color: white;">Verification Code</h2>
        <div style="margin: 40px 0;">
          <span style="font-size: 36px; font-weight: bold; color: #D4AF37; border: 1px dashed #D4AF37; padding: 15px 30px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 12px; color: #D4AF37;">Valid for 5 minutes</p>
      </div>
    `;

    // 4. Brevo API Call with targeted error handling
    console.log(`Sending OTP to Brevo for: ${normalizedEmail}`);
    
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "GNC Support", email: "noreply@gopinathcollection.co.in" },
        to: [{ email: normalizedEmail }],
        subject: "Verification Code - Gopi Nath Collection",
        htmlContent: htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000, // Increased to 15s to prevent Render disconnects
      }
    );

    return res.status(200).send({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("--- SEND OTP ERROR ---");
    
    // Handle Brevo specific response errors
    if (error.response) {
      console.error("Brevo Error Data:", error.response.data);
      return res.status(error.response.status).send({
        success: false,
        message: "Email service error",
        error: error.response.data.message || "Configuration error",
      });
    }

    // Handle Timeouts
    if (error.code === 'ECONNABORTED') {
      return res.status(504).send({
        success: false,
        message: "Request took too long. Please try again.",
      });
    }

    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
/* =====================================================
   2. VERIFY OTP
===================================================== */
export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // ✅ CLEAR OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).send({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).send({
      success: false,
      message: "OTP verification failed",
    });
  }
};

/* =====================================================
   3. REGISTER
===================================================== */
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, userId } = req.body;

    /* address is now an object */
    const { fullAddress, city, state, pincode } = address || {};

    // 1️⃣ Strict validation
    if (
  !name ||
  !phone ||
  !password ||
  !address?.fullAddress ||
  !address?.city ||
  !address?.state ||
  !address?.pincode
) {
  return res.status(400).send({
    success: false,
    message: "All security registry fields are required"
  });
}

    // 2️⃣ Find OTP-verified placeholder user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Email not verified. Please verify OTP first."
      });
    }

    // 3️⃣ Update user with real data
    user.name = name;
    user.phone = phone;

    user.address = {
      fullAddress,
      city,
      state,
      pincode
    };

    user.status = "Active";
    user.password = await hashPassword(password);

    // Permanent customer ID
    user.customId = userId || `GN-${phone}`;

    await user.save();

    // 4️⃣ Generate JWT
    const token = JWT.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).send({
      success: true,
      message: "Registration completed successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};

/* =====================================================
   4. LOGIN
===================================================== */
// Inside your authController.js
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user || !user.password) {
      return res.status(200).send({
        success: false,
        message: "Email not registered"
      });
    }

    if (user.status === "Disabled") {
      return res.status(200).send({
        success: false,
        message: "Account disabled"
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid password"
      });
    }

    const token = JWT.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    /* ✅ Safe user payload */
    const sanitizedUser = {
      _id: user._id,
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      address: {
        fullAddress: user.address?.fullAddress || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        pincode: user.address?.pincode || ""
      },
      role: user.role,
      status: user.status
    };

    res.status(200).send({
      success: true,
      token,
      user: sanitizedUser
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Login failed"
    });
  }
};

/* =====================================================
   5. FORGOT PASSWORD
===================================================== */
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.status(200).send({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Password reset failed",
    });
  }
};

/* =====================================================
   6. UPDATE PROFILE
===================================================== */
export const updateProfileController = async (req, res) => {
  try {
    const { name, phone, address, city, pincode, state, password } = req.body;

    // 1. Log incoming data for debugging
    console.log("--- DEBUG: PROFILE UPDATE ATTEMPT ---");
    console.log("Incoming Data:", { name, phone, address, city, pincode, state });

    // Build update object based on nested User Schema
    const updateData = {
      name,
      phone,
      address: {
        fullAddress: address, // Maps street address to fullAddress
        city,
        pincode,
        state,
      },
    };

    if (password && password.length >= 6) {
      updateData.password = await hashPassword(password);
    }

    // 2. Perform the update
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Shipping and Profile details synchronized",
      updatedUser,
    });
  } catch (error) {
    console.error("--- DEBUG: PROFILE_UPDATE_ERROR ---");
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to update details for checkout",
      error: error.message
    });
  }
};
/* =====================================================
   7. GET ALL USERS (ADMIN)
===================================================== */
export const getAllUsersController = async (req, res) => {
  try {
    const users = await UserModel.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Fetch users failed",
    });
  }
};

/* =====================================================
   8. UPDATE USER (ADMIN)
===================================================== */
export const updateUserAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // ✅ Sanitization: remove placeholders before saving to MongoDB
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === "Pending" || updateData[key] === "" || updateData[key] === null) {
        delete updateData[key];
      }
    });

    // Security: Exclude password from administrative updates to prevent corruption
    delete updateData.password;

    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.status(200).send({
      success: true,
      message: "Identity Record Updated",
      user,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Update operation failed" });
  }
};

/* =====================================================
   9. DELETE USER
===================================================== */
export const deleteUserController = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).send({
        success: false,
        message: "You cannot delete yourself",
      });
    }

    await UserModel.findByIdAndDelete(req.params.id);

    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Delete failed",
    });
  }
};
// Ensure this import is at the top of your authControllers.js
export const updateProfileAddressController = async (req, res) => {
  try {
    // 1. Destructure the nested address object from the body
    const { name, phone, address } = req.body;
    const { fullAddress, city, pincode, state } = address || {};

    // DEBUG: Log incoming data from the frontend form
    console.log("--- DEBUG: INCOMING ADDRESS UPDATE ---");
    console.log("Payload:", { name, phone, fullAddress, city, pincode, state });

    // 2. Update database using the nested structure defined in UserModel
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phone,
        // Match the nested object structure in your User Schema
        address: {
          fullAddress,
          city,
          pincode,
          state,
        },
      },
      { new: true }
    );

    // 3. Log the database response to verify synchronization
    if (updatedUser) {
      console.log("--- DEBUG: DATABASE UPDATE SUCCESS ---");
      console.log("Updated User Result:", {
        id: updatedUser._id,
        // Check nested values
        city: updatedUser.address?.city,
        pincode: updatedUser.address?.pincode,
        state: updatedUser.address?.state
      });
    }

    res.status(200).send({
      success: true,
      message: "Shipping address updated and synced",
      updatedUser,
    });
  } catch (error) {
    // 4. Log the error if the update fails
    console.log("--- DEBUG: UPDATE_ADDRESS_ERROR ---");
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Error updating shipping address",
      error: error.message,
    });
  }
};


/* =====================================================
   10. TEST CONTROLLER
===================================================== */
export const testController = (req, res) => {
  res.send({ ok: true });
};
