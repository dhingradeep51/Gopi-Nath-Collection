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

    const order = await Order.findById(orderId)
      .populate("buyer")
      .populate("products.product")
      .populate("paymentDetails");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Existing mapping logic for PAID vs COD
    const rawMethod = order.paymentDetails?.method?.toLowerCase() || "cod";
    const paymentStatus = order.paymentDetails?.status || "PENDING";
    let finalPaymentMethod = (rawMethod === "phonepe" || rawMethod === "online" || paymentStatus === "PAID") ? "PAID" : "COD";

    // ✅ NEW: Initialize top-level totals to prevent 'undefined' errors
    let totalTaxableValue = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalGSTAmount = 0;

    const items = order.products.map((item) => {
      const lineTotal = item.price * (item.qty || 1);
      const itemGST = calculateGST({
        totalPaid: lineTotal,
        sellerState: "Haryana",
        buyerState: order.buyer?.state || "Haryana",
        gstRate: item.gstRate || 0,
      });

      // ✅ NEW: Accumulate totals for the entire invoice
      totalTaxableValue += itemGST.taxableValue;
      totalCGST += itemGST.cgst;
      totalSGST += itemGST.sgst;
      totalIGST += itemGST.igst;
      totalGSTAmount += itemGST.totalGST;

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

    const invNo = await generateInvoiceNumber();

    // 7️⃣ Create Invoice with aggregated numeric values
    const invoice = await Invoice.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      invoiceNumber: invNo,
      sellerName: "Gopi Nath Collection",
      sellerAddress: "56 Krishna Nagar New Model Town, Panipat, Haryana - 132103",
      sellerState: "Haryana",
      buyerName: order.buyer?.name || "Guest",
      buyerAddress: order.address,
      buyerState: order.buyer?.state || "Haryana",
      paymentMethod: finalPaymentMethod,
      subtotal: order.subtotal,
      discount: order.discount || 0,
      shippingCharges: order.shippingFee || 0,
      totalPaid: order.totalPaid,
      // ✅ CRITICAL: Assign the aggregated totals so toFixed() has a value to read
      taxableValue: +totalTaxableValue.toFixed(2),
      cgst: +totalCGST.toFixed(2),
      sgst: +totalSGST.toFixed(2),
      igst: +totalIGST.toFixed(2),
      totalGST: +totalGSTAmount.toFixed(2),
      gstType: totalIGST > 0 ? "IGST" : "CGST_SGST",
      items,
      pdfPath: `/uploads/invoices/${invNo.replace(/\//g, "-")}.pdf`,
    });

    // Update order status
    order.isInvoiced = true;
    order.invoiceNo = invoice.invoiceNumber;
    order.invoiceDate = invoice.createdAt;
    await order.save(); 

    // Generate PDF now that database values are present and defined
    await generateInvoicePDF(invoice);

    return res.status(200).json({ success: true, message: "Invoice generated", invoice });

  } catch (error) {
    console.error("Invoice Controller Error:", error);
    return res.status(500).json({ success: false, message: error.message });
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