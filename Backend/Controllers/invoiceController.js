import Invoice from "../Models/invoiceModel.js";
import Order from "../Models/orderModel.js";
import Products from "../Models/productModel.js";

import { generateInvoiceNumber } from "../Helpers/invoiceNumberHelper.js";
import { calculateGST } from "../Helpers/gstCalculator.js";
import { generateInvoicePDF } from "../Helpers/invoiceGenerator.js"
import fs from "fs";
import path from "path";


export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    /* 1️⃣ Fetch order with deep population */
    // ✅ FIX: Must populate paymentDetails to access the payment method
    const order = await Order.findById(orderId)
      .populate("buyer")
      .populate("products.product")
      .populate("paymentDetails"); 

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    /* 🔒 2️⃣ Hard Guard: Prevent Duplicate Invoices */
    const existingInvoice = await Invoice.findOne({ orderId: order._id });
    if (existingInvoice) {
      return res.status(201).json({
        success: true,
        message: "Invoice already exists",
        invoice: existingInvoice,
      });
    }

    /* 🚦 3️⃣ Logic: COD vs Prepaid Permissions */
    // ✅ FIX: Use order.paymentDetails.method instead of order.payment.method
    const method = order.paymentDetails?.method || "cod";
    const isPrepaid = method === "phonepe" || method === "online";
    const isDelivered = order.status === "Delivered";

    // COD orders are blocked until Delivered, but Prepaid can be invoiced immediately
    if (!isPrepaid && !isDelivered) {
      return res.status(403).json({
        success: false,
        message: "COD orders must be marked 'Delivered' before invoicing.",
      });
    }

    /* 4️⃣ Financial Setup */
    const sellerDetails = {
      name: "Gopi Nath Collection",
      gstin: "GST-PENDING",
      address: "56 Krishna Nagar New Model Town, Panipat, Haryana - 132103",
      state: "Haryana",
    };

    const buyerState = order.buyer?.state || "Haryana";
    const finalAmount = order.totalPaid; // Using the totalPaid from OrderModel

    /* 5️⃣ Item & GST Mapping */
    const items = order.products.map((item) => {
      const lineTotal = item.price * (item.qty || 1);
      const itemGST = calculateGST({
        totalPaid: lineTotal,
        sellerState: sellerDetails.state,
        buyerState,
        gstRate: item.gstRate || 0,
      });

      return {
        productId: item.product?._id,
        productName: item.name,
        qty: item.qty || 1,
        unitPrice: item.price,
        finalPrice: lineTotal,
        taxableValue: itemGST.taxableValue,
        cgst: itemGST.cgst,
        sgst: itemGST.sgst,
        igst: itemGST.igst,
      };
    });

    /* 6️⃣ Create Unique Identity */
    const invNo = await generateInvoiceNumber();

    /* 7️⃣ Create Invoice Document in Database */
    const invoice = await Invoice.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      invoiceNumber: invNo,
      sellerName: sellerDetails.name,
      sellerGstin: sellerDetails.gstin,
      sellerAddress: sellerDetails.address,
      sellerState: sellerDetails.state,
      buyerName: order.buyer?.name || "Guest",
      buyerAddress: order.address,
      buyerState,
      paymentMethod: method.toUpperCase(), // Using the corrected method
      subtotal: order.subtotal,
      discount: order.discount || 0,
      shippingCharges: order.shippingFee || 0,
      totalPaid: finalAmount,
      items,
      pdfPath: `/uploads/invoices/${invNo.replace(/\//g, "-")}.pdf`,
    });

    /* ✅ 🔟 DATABASE PERSISTENCE */
    try {
      order.isInvoiced = true;
      order.invoiceNo = invoice.invoiceNumber;
      order.invoiceDate = invoice.createdAt;
      
      await order.save(); 
      console.log("✅ DB Update Success: Order marked as Invoiced");
    } catch (dbError) {
      console.error("❌ Database Save Error:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to update Order status.",
        error: dbError.message,
      });
    }

    /* 📄 11️⃣ Physical PDF Generation */
    await generateInvoicePDF(invoice);

    return res.status(200).json({
      success: true,
      message: "Invoice generated successfully",
      invoice,
    });

  } catch (error) {
    console.error("Generate Invoice Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during generation",
      error: error.message,
    });
  }
};

// Get invoice by orderId
export const getInvoiceByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const invoice = await Invoice.findOne({ orderId })
      .populate("orderId");

    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        message: "Invoice not found" 
      });
    }

    return res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch invoice",
      error: error.message
    });
  }
};

// Get invoice by invoiceId
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate("orderId");

    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        message: "Invoice not found" 
      });
    }

    return res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error("Get invoice by ID error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch invoice",
      error: error.message
    });
  }
};

// Get all invoices (Admin only)
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .populate("orderId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    console.error("Get all invoices error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message
    });
  }
};
export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice record not found" });
    }

    const filePath = path.join(process.cwd(), invoice.pdfPath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Invoice PDF file not found" });
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`
    });

    fs.createReadStream(filePath).pipe(res);

  } catch (error) {
    console.error("PDF DOWNLOAD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download invoice PDF"
    });
  }
};
export const viewInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    const filePath = path.join(process.cwd(), invoice.pdfPath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Invoice PDF file not found" });
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "no-store"
    });

    fs.createReadStream(filePath).pipe(res);

  } catch (error) {
    console.error("VIEW INVOICE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to view invoice PDF"
    });
  }
};



export default {
  generateInvoice,
  getInvoiceByOrderId,
  getInvoiceById,
  getAllInvoices,
  downloadInvoicePDF,
  viewInvoicePDF
};