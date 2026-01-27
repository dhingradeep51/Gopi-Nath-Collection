import JWT from "jsonwebtoken";
import UserModel from "../Models/userModel.js";


// Protecting routes
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decode = JWT.verify(token, process.env.JWT_SECRET);

    // ✅ FIX: Fetch full user to ensure name is available for reviews
    const user = await UserModel.findById(decode._id).select("-password");
    
    if (!user) {
      return res.status(401).send({ message: "User no longer exists" });
    }

    // Attach the full database user object to the request
    req.user = user; 
    
    console.log("AUTH SUCCESS - User Name:", req.user.name);
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);
    return res.status(401).send({ message: "Invalid token" });
  }
};



//admin middleware
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).send({ message: "Unauthorized - No user found" });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user || user.role !== 1) {
      return res.status(403).send({ message: "Admin access denied" });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Admin middleware error" });
  }
};

export const isUserActive = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user._id);
        
        // ✅ If user not found or status is "Disabled", block access
        if (!user || user.status === "Disabled") {
            return res.status(403).send({
                success: false,
                message: "Your account is disabled. You have been logged out.",
                logout: true, // 👈 Flag for frontend to trigger logout
            });
        }
        next();
    } catch (error) {
        res.status(401).send({ success: false, message: "Authentication Error" });
    }
};