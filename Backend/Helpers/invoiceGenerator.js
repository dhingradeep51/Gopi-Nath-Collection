import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.join(process.cwd(), "uploads", "invoices");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `${(invoice.invoiceNumber || "INV").replace(/\//g, "-")}.pdf`;
      const filePath = path.join(dir, filename);

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        fs.writeFileSync(filePath, pdfBuffer);
        resolve(pdfBuffer);
      });

      // Styling Constants
      const gold = "#D4AF37";
      const burgundy = "#2D0A14";
      const lightGray = "#f9f9f9";

      /* ---------- HEADER SECTION ---------- */
      doc.fontSize(22).fillColor(burgundy).font("Helvetica-Bold").text("Gopi Nath Collection", 40, 40);
      doc.fontSize(9).fillColor("#555").font("Helvetica")
        .text("56 Krishna Nagar New Model Town, Panipat, Haryana - 132103")
        .text(`GSTIN: ${invoice.sellerGstin || "YOUR_GSTIN_HERE"}`);

      doc.fontSize(16).fillColor(gold).font("Helvetica-Bold").text("TAX INVOICE", 400, 40, { align: "right" });
      doc.fontSize(9).fillColor("#333").font("Helvetica")
        .text(`Inv: ${invoice.invoiceNumber || ""}`, 400, 60, { align: "right" })
        .text(`Order: ${invoice.orderNumber || ""}`, 400, 72, { align: "right" });

      doc.moveTo(40, 100).lineTo(555, 100).strokeColor(gold).lineWidth(1).stroke();

      /* ---------- BILLING & PAYMENT SECTION ---------- */
      doc.moveDown(2);
      const topOfDetails = doc.y;
      
      // Left Side: Bill To
      doc.fontSize(10).fillColor(burgundy).font("Helvetica-Bold").text("BILL TO", 40, topOfDetails);
      doc.moveTo(40, topOfDetails + 12).lineTo(250, topOfDetails + 12).strokeColor("#ccc").stroke();
      doc.fontSize(9).fillColor("#333").font("Helvetica-Bold").text(invoice.buyerName || "Deepak", 40, topOfDetails + 20);
      doc.font("Helvetica").text(invoice.buyerAddress || "", { width: 200 });

      // Right Side: Payment
      doc.fontSize(10).fillColor(burgundy).font("Helvetica-Bold").text("PAYMENT", 300, topOfDetails);
      doc.moveTo(300, topOfDetails + 12).lineTo(555, topOfDetails + 12).strokeColor("#ccc").stroke();
      doc.fontSize(9).fillColor("#333").font("Helvetica")
        .text(`Method: ${invoice.paymentMethod || "COD"}`, 300, topOfDetails + 20)
        .text(`Status: SUCCESS`, 300);

      /* ---------- ITEM TABLE ---------- */
      doc.moveDown(4);
      const tableTop = doc.y;
      const col = { item: 40, qty: 260, mrp: 310, taxable: 390, gst: 480, total: 520 };

      // Header Bar
      doc.rect(40, tableTop, 515, 20).fill(burgundy);
      doc.fontSize(9).fillColor("#FFF").font("Helvetica-Bold");
      doc.text("Item", col.item + 5, tableTop + 6);
      doc.text("Qty", col.qty, tableTop + 6);
      doc.text("MRP (Inc.)", col.mrp, tableTop + 6);
      doc.text("Taxable Val", col.taxable, tableTop + 6);
      doc.text("GST", col.gst, tableTop + 6);
      doc.text("Total", col.total, tableTop + 6);

      // Rows
      let currentY = tableTop + 25;
      doc.fillColor("#333").font("Helvetica").fontSize(9);

      (invoice.items || []).forEach((item) => {
        doc.text(item.productName || "", col.item + 5, currentY, { width: 200 });
        doc.text(item.qty || 0, col.qty, currentY);
        doc.text(`₹${(item.unitPrice || 0).toFixed(2)}`, col.mrp, currentY);
        doc.text(`₹${(item.taxableValue || 0).toFixed(2)}`, col.taxable, currentY);
        doc.text(`₹${((item.cgst || 0) + (item.sgst || 0) + (item.igst || 0)).toFixed(2)}`, col.gst, currentY);
        doc.text(`₹${(item.finalPrice || 0).toFixed(2)}`, col.total, currentY);
        currentY += 20;
      });

      /* ---------- SUMMARY BOX ---------- */
      const summaryY = currentY + 30;
      const boxWidth = 220;
      const boxX = 335;

      doc.rect(boxX, summaryY, boxWidth, 115).strokeColor(gold).lineWidth(1).stroke();
      
      const rowHeight = 18;
      let rowY = summaryY + 10;

      const drawRow = (label, value, color = "#555", isBold = false) => {
        doc.fontSize(9).fillColor(color).font(isBold ? "Helvetica-Bold" : "Helvetica");
        doc.text(label, boxX + 10, rowY);
        doc.text(value, boxX + 10, rowY, { align: "right", width: boxWidth - 20 });
        rowY += rowHeight;
      };

      drawRow("Item Total (Incl. GST)", `₹${(invoice.subtotal || 0).toFixed(2)}`);
      drawRow("Less: Discount", `- ₹${(invoice.discount || 0).toFixed(2)}`, "#e74c3c");
      drawRow("Shipping Fee", `₹${(invoice.shippingCharges || 0).toFixed(2)}`);
      
      doc.moveTo(boxX + 5, rowY - 5).lineTo(boxX + boxWidth - 5, rowY - 5).strokeColor(gold).stroke();
      
      drawRow("Taxable Value (Base)", `₹${(invoice.taxableValue || 0).toFixed(2)}`, "#333", true);
      drawRow("Total GST (CGST_SGST)", `₹${((invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0)).toFixed(2)}`, "#333", true);

      // Total Final Row
      doc.rect(boxX, rowY - 5, boxWidth, 25).fill(burgundy);
      doc.fontSize(10).fillColor(gold).font("Helvetica-Bold");
      doc.text("NET AMOUNT PAYABLE", boxX + 10, rowY);
      doc.text(`₹${(invoice.totalPaid || 0).toFixed(2)}`, boxX + 10, rowY, { align: "right", width: boxWidth - 20 });

      doc.end();
    } catch (err) { reject(err); }
  });
};