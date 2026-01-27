import rateLimit from 'express-rate-limit';

// Define the limit for OTP and Auth routes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: "Too many attempts from this IP, please try again after 15 minutes."
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable the older headers
});