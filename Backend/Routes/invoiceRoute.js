import express from "express";
import {
  generateInvoice,
  getInvoiceByOrderId,
  getInvoiceById,
  getAllInvoices,
  downloadInvoicePDF,
  viewInvoicePDF // Added for inline viewing
} from "../Controllers/invoiceController.js";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// 1️⃣ Generate Invoice (Admin Only)
// Enforces logic: Prepaid = Instant, COD = Only after 'Delivered'
router.post("/generate",  generateInvoice);

// 2️⃣ Fetch All Invoices (Admin Only)
router.get("/all-invoices", requireSignIn, isAdmin, getAllInvoices);

// 3️⃣ Get invoice using orderId 
router.get("/order/:orderId", requireSignIn, getInvoiceByOrderId);

// 4️⃣ Get invoice using invoiceId
router.get("/get-invoice/:id", requireSignIn, getInvoiceById);

// 5️⃣ Download PDF (Triggers browser download)
// Fixed the route syntax from "/pdf:id" to "/download/:id"
router.get("/download/:id", requireSignIn, downloadInvoicePDF);

// 6️⃣ View PDF (Opens in browser tab - Inline)
router.get("/view/:id", requireSignIn, viewInvoicePDF);

export default router;