import Invoice from "../Models/invoiceModel.js";
import Order from "../Models/orderModel.js";
import Products from "../Models/productModel.js";

import { generateInvoiceNumber } from "../Helpers/invoiceNumberHelper.js";
import { calculateGST } from "../Helpers/gstCalculator.js";
import { generateInvoicePDF } from "../Helpers/invoiceGenerator.js"


export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    /* 1️⃣ Fetch order with buyer details */
    const order = await Order.findById(orderId)
      .populate("buyer")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.isInvoiced) {
      return res.status(400).json({ success: false, message: "Invoice already generated" });
    }

    /* 🚀 2️⃣ Invoice Generation Permission */
    const isPrepaid = order.payment?.method === "online";
    const isDelivered = order.status === "Delivered";

    if (!isPrepaid && !isDelivered) {
      return res.status(403).json({
        success: false,
        message: "Invoice cannot be generated for COD orders until they are marked as 'Delivered'."
      });
    }

    /* 3️⃣ Business & Buyer Information */
    const sellerDetails = {
      name: "Gopi Nath Collection",
      gstin: "GST", 
      address: "56 Krishna Nagar New Model Town, Panipat, Haryana - 132103",
      state: "Haryana"
    };

    const buyerInfo = order.buyer;
    const buyerAddress = buyerInfo?.address;
    
    const formattedBuyerAddress = buyerAddress 
      ? `${buyerAddress.fullAddress}, ${buyerAddress.city}, ${buyerAddress.state} - ${buyerAddress.pincode}`
      : "Address Not Provided";

    const buyerState = buyerAddress?.state || "Haryana";

    /* 4️⃣ Final amount calculation */
    const finalAmount = order.subtotal - (order.discount || 0) + (order.shippingFee || 0);

    /* 5️⃣ Invoice-level GST */
    const invoiceGST = calculateGST({
      totalPaid: finalAmount,
      sellerState: sellerDetails.state,
      buyerState: buyerState,
      gstRate: order.highestGstRate || 0
    });

    /* 6️⃣ Item-wise GST calculation */
    const items = order.products.map((item) => {
      const qty = item.qty || 1;
      const lineTotal = item.price * qty;
      const itemGST = calculateGST({
        totalPaid: lineTotal,
        sellerState: sellerDetails.state,
        buyerState: buyerState,
        gstRate: item.gstRate || 0
      });

      return {
        productId: item.product?._id,
        productName: item.name,
        qty,
        unitPrice: item.price,
        finalPrice: lineTotal,
        taxableValue: itemGST.taxableValue,
        cgst: itemGST.cgst,
        sgst: itemGST.sgst,
        igst: itemGST.igst
      };
    });

    /* 7️⃣ Prepare unique filename and path */
    const invNo = await generateInvoiceNumber();
    const filename = `${invNo.replace(/\//g, "-")}.pdf`;
    const relativePath = `/uploads/invoices/${filename}`;

    /* 8️⃣ Create Invoice Record in MongoDB */
    const invoice = await Invoice.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      invoiceNumber: invNo,
      sellerName: sellerDetails.name,
      sellerGstin: sellerDetails.gstin,
      sellerAddress: sellerDetails.address,
      sellerState: sellerDetails.state,
      buyerName: buyerInfo?.name || "Guest",
      buyerAddress: formattedBuyerAddress,
      buyerState: buyerState,
      placeOfSupply: buyerState,
      paymentMethod: order.payment?.method?.toUpperCase() || "COD",
      subtotal: order.subtotal,
      discount: order.discount || 0,
      shippingCharges: order.shippingFee || 0,
      taxableValue: invoiceGST.taxableValue,
      cgst: invoiceGST.cgst,
      sgst: invoiceGST.sgst,
      igst: invoiceGST.igst,
      totalPaid: finalAmount,
      gstType: invoiceGST.gstType,
      items,
      pdfPath: relativePath // ✅ Link to the physical file
    });

    /* 9️⃣ Generate and Save the actual PDF file to the server */
    await generateInvoicePDF(invoice);

    /* 🔟 Update order status */
    order.isInvoiced = true;
    order.invoiceNo = invoice.invoiceNumber;
    order.invoiceDate = invoice.createdAt;
    await order.save();

    return res.status(201).json({
      success: true,
      message: "Invoice generated and saved successfully",
      invoice
    });

  } catch (error) {
    console.error("Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Invoice generation failed",
      error: error.message
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
      return res.status(404).json({ message: "Invoice not found" });
    }

    const pdf = await generateInvoicePDF(invoice);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${invoice.invoiceNumber}.pdf`
    });

    res.send(pdf);
  } catch (error) {
    res.status(500).json({ message: "PDF generation failed" });
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

    const pdfBuffer = await generateInvoicePDF(invoice);

    res.set({
      "Content-Type": "application/pdf",
      // 👇 INLINE = show in admin panel
      "Content-Disposition": `inline; filename=${invoice.invoiceNumber}.pdf`,
      "Cache-Control": "no-store"
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("Invoice PDF Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to generate invoice PDF"
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