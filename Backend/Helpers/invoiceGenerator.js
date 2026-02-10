import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import moment from "moment";

/**
 * Helper: Converts numbers to Indian Currency Words
 */
const numberToWords = (num) => {
  if (!num || num === 0) return "Zero";
  num = Math.round(num);
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convert = (n) => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  return convert(num) + " Only";
};

export const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.join(process.cwd(), "uploads", "invoices");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `${(invoice.invoiceNumber || "INV").replace(/\//g, "-")}.pdf`;
      const filePath = path.join(dir, filename);

      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        fs.writeFileSync(filePath, pdfBuffer);
        resolve(pdfBuffer);
      });

      const gold = "#D4AF37";
      const burgundy = "#2D0A14";
      const cream = "#FDF8F0";
      const textDark = "#2C2C2C";
      const textMid = "#5A5A5A";
      const PW = 595.28, PH = 841.89, ML = 42, CW = PW - (ML * 2);

      doc.rect(0, 0, PW, PH).fill(cream);

      // --- Header ---
      doc.fontSize(22).fillColor(burgundy).font("Helvetica-Bold").text("Gopi Nath Collection", ML, 40);
      doc.fontSize(8.5).fillColor(textMid).font("Helvetica").text("56 Krishna Nagar New Model Town, Panipat, Haryana - 132103", ML, 70);
      doc.fontSize(8.5).fillColor(textDark).font("Helvetica-Bold").text(`GSTIN: ${invoice.sellerGstin || "GST-PENDING"}`, ML, 82);

      doc.fontSize(16).fillColor(gold).text("TAX INVOICE", ML, 40, { align: "right", width: CW });
      doc.fontSize(8.5).fillColor(textMid).font("Helvetica")
        .text(`Inv: ${invoice.invoiceNumber}`, ML, 65, { align: "right", width: CW })
        .text(`Order: ${invoice.orderNumber}`, ML, 77, { align: "right", width: CW })
        .text(`Date: ${moment(invoice.createdAt).format("DD-MM-YYYY")}`, ML, 89, { align: "right", width: CW });

      doc.moveTo(ML, 105).lineTo(ML + CW, 105).strokeColor(gold).lineWidth(1.5).stroke();

      // --- Address & Payment ---
      const infoY = 120, colW = CW / 2;
      doc.fontSize(10).fillColor(gold).font("Helvetica-Bold").text("BILL TO", ML, infoY);
      doc.fontSize(9).fillColor(textDark).font("Helvetica-Bold").text(invoice.buyerName || "Customer", ML, infoY + 18);
      doc.fontSize(8.5).fillColor(textMid).font("Helvetica").text(invoice.buyerAddress || "", ML, infoY + 30, { width: colW - 20 });

      doc.fontSize(10).fillColor(gold).font("Helvetica-Bold").text("PAYMENT", ML + colW, infoY);
      let payY = infoY + 18;
      const paymentLines = [
        { l: "Method", v: invoice.paymentMethod || "COD" },
        { l: "Status", v: "PAID" },
        { l: "Order ID", v: invoice.orderNumber }
      ];
      paymentLines.forEach(p => {
        doc.fontSize(8.5).fillColor(textMid).text(`${p.l}: `, ML + colW, payY, { continued: true }).fillColor(textDark).text(p.v);
        payY += 14;
      });

      // --- Items Table ---
      const tableY = 210;
      const cols = [
        { label: "Item", x: 0, w: 200, align: "left" },
        { label: "Qty", x: 200, w: 40, align: "center" },
        { label: "MRP (Inc.)", x: 240, w: 80, align: "right" },
        { label: "Taxable Val", x: 320, w: 80, align: "right" },
        { label: "GST", x: 400, w: 50, align: "right" },
        { label: "Total", x: 450, w: CW - 450, align: "right" }
      ];

      doc.rect(ML, tableY, CW, 20).fill(burgundy);
      cols.forEach(c => doc.fontSize(8.5).fillColor(gold).font("Helvetica-Bold").text(c.label, ML + c.x + 5, tableY + 6, { width: c.w - 10, align: c.align }));

      let rowY = tableY + 20;
      invoice.items.forEach((item, i) => {
        doc.rect(ML, rowY, CW, 20).fill(i % 2 === 0 ? "#FFFFFF" : "#FAF8F4");
        doc.fillColor(textDark).font("Helvetica").fontSize(8.5);
        doc.text(item.productName, ML + cols[0].x + 5, rowY + 6, { width: cols[0].w - 10 });
        doc.text(item.qty, ML + cols[1].x, rowY + 6, { width: cols[1].w, align: "center" });
        // ✅ Safety added: (value || 0).toFixed(2)
        doc.text(`₹${(item.unitPrice || 0).toFixed(2)}`, ML + cols[2].x, rowY + 6, { width: cols[2].w - 5, align: "right" });
        doc.text(`₹${(item.taxableValue || 0).toFixed(2)}`, ML + cols[3].x, rowY + 6, { width: cols[3].w - 5, align: "right" });
        doc.text(`₹${((item.cgst || 0) + (item.sgst || 0) + (item.igst || 0)).toFixed(2)}`, ML + cols[4].x, rowY + 6, { width: cols[4].w - 5, align: "right" });
        doc.text(`₹${(item.finalPrice || 0).toFixed(2)}`, ML + cols[5].x, rowY + 6, { width: cols[5].w - 5, align: "right" });
        rowY += 20;
      });

      // --- Invoice Summary ---
      const sumY = rowY + 20, sumW = 230, sumX = ML + CW - sumW;
      doc.rect(sumX, sumY, sumW, 130).strokeColor(gold).lineWidth(1).stroke();
      doc.rect(sumX, sumY, sumW, 20).fill(burgundy);
      doc.fontSize(9).fillColor(gold).font("Helvetica-Bold").text("INVOICE SUMMARY", sumX + 10, sumY + 6);

      let subY = sumY + 28;
      const drawRow = (label, value, color = textDark) => {
        // ✅ Safety added: (value || 0).toFixed(2)
        const displayValue = (value || 0).toFixed(2);
        doc.fontSize(8.5).fillColor(textMid).font("Helvetica").text(label, sumX + 10, subY);
        doc.fillColor(color).text(`₹${displayValue}`, sumX, subY, { width: sumW - 10, align: "right" });
        subY += 16;
      };

      drawRow("Item Total (Incl. GST)", invoice.subtotal);
      drawRow("Less: Discount", Math.abs(invoice.discount || 0), "#CC3300");
      doc.moveTo(sumX + 10, subY - 4).lineTo(sumX + sumW - 10, subY - 4).strokeColor("#EEE").stroke();
      drawRow("Taxable Value (Base)", invoice.taxableValue);
      drawRow("CGST", invoice.cgst);
      drawRow("SGST", invoice.sgst);
      if (invoice.igst > 0) drawRow("IGST", invoice.igst);

      doc.rect(sumX, sumY + 105, sumW, 25).fill(burgundy);
      doc.fontSize(9).fillColor(gold).font("Helvetica-Bold").text("NET AMOUNT PAYABLE", sumX + 10, sumY + 113);
      doc.text(`₹${(invoice.totalPaid || 0).toFixed(2)}`, sumX, sumY + 113, { width: sumW - 10, align: "right" });

      doc.fontSize(7.5).fillColor(textMid).font("Helvetica-Bold").text("AMOUNT IN WORDS:", ML, sumY + 10);
      doc.fontSize(9).fillColor(textDark).text(numberToWords(invoice.totalPaid || 0), ML, sumY + 22, { width: colW });

      doc.fontSize(8).fillColor("#999").text("Digitally generated for Gopi Nath Collection. No signature required.", 0, PH - 40, { align: "center", width: PW });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};