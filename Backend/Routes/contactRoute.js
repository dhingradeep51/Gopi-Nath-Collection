import express from "express";
import { 
    contactUsController,
    getAllTicketsController,
    getTicketStatsController,
    replyTicketController,
    deleteTicketController,
    getUserTicketsController,
    isAdminReplyAttachmentController,
    getUserAttachmentController
} from "../Controllers/contactControllers.js";
import { authLimiter } from "../Middlewares/rateMiddleware.js";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddleware.js";
import { upload } from "../Middlewares/multerConfig.js";

const router = express.Router();

// 1. CREATE TICKET (USER SIDE)
router.post("/send-message", authLimiter, upload.single("attachment"), contactUsController);

// 2. FETCH ALL TICKETS (ADMIN SIDE)
router.get("/all-tickets", requireSignIn, isAdmin, getAllTicketsController);

// 3. TICKET STATISTICS (ADMIN SIDE)
router.get("/ticket-stats", requireSignIn, isAdmin, getTicketStatsController);

// 4. REPLY TO TICKET (ADMIN SIDE)
router.post(
    "/reply-ticket/:id", 
    requireSignIn, 
    isAdmin, 
    upload.single("adminAttachment"), 
    replyTicketController
);

// ✅ FIX: Parameter name changed to :id to match controller expectations
// This matches: /api/v1/contact/admin-reply-attachment/${t._id}/${i}
router.get(
    "/admin-reply-attachment/:id/:replyIndex", 
    requireSignIn, 
    isAdminReplyAttachmentController
);

// 5. DELETE TICKET (ADMIN SIDE)
router.delete("/delete-ticket/:id", requireSignIn, isAdmin, deleteTicketController);

// 6. TRACK USER TICKETS (USER SIDE)
router.get("/user-tickets/:userId", requireSignIn, getUserTicketsController);

// ✅ Fetches the original user attachment
router.get("/ticket-attachment/:id", requireSignIn, getUserAttachmentController);

export default router;