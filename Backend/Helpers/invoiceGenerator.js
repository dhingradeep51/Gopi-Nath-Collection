import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

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
      /* ────── File Setup ────── */
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

      /* ────── Brand Palette ────── */
      const gold = "#D4AF37";
      const burgundy = "#2D0A14";
      const darkBg = "#1a1018";
      const cream = "#FDF8F0";
      const tableHead = "#2D0A14";
      const textDark = "#2C2C2C";
      const textMid = "#5A5A5A";

      /* ────── Page Dimensions ────── */
      const PW = 595.28;
      const PH = 841.89;
      const ML = 42;
      const CW = PW - (ML * 2);

      /* ── Background ── */
      doc.rect(0, 0, PW, PH).fill(cream);

      /* ────── Top Header ────── */
      const hdrH = 110;
      doc.rect(0, 0, PW, hdrH).fill(darkBg);
      doc.rect(0, hdrH, PW, 3).fill(gold);

      doc.fontSize(22).fillColor("#FFFFFF").font("Helvetica-Bold").text("Gopi Nath Collection", ML, 25);
      
      doc.fontSize(8.5).fillColor("#AAAAAA").font("Helvetica")
        .text("56 Krishna Nagar New Model Town, Panipat, Haryana - 132103", ML, 55)
        .fillColor(gold).font("Helvetica-Bold").text(`GSTIN: ${invoice.sellerGstin || "YOUR_GSTIN_NUMBER_HERE"}`, ML, 68);

      doc.fontSize(18).fillColor(gold).font("Helvetica-Bold").text("TAX INVOICE", ML, 25, { align: "right", width: CW });
      doc.fontSize(8.5).fillColor("#CCCCCC").font("Helvetica")
        .text(`Inv: ${invoice.invoiceNumber || "N/A"}`, ML, 52, { align: "right", width: CW })
        .text(`Order: ${invoice.orderNumber || "N/A"}`, ML, 64, { align: "right", width: CW })
        .text(`Date: ${invoice.date || new Date().toLocaleDateString("en-IN")}`, ML, 76, { align: "right", width: CW });

      /* ────── Info Blocks ────── */
      const infoY = hdrH + 30;
      const colW = CW / 2;

      const drawHeaderLine = (x, title) => {
        doc.fontSize(10).fillColor(gold).font("Helvetica-Bold").text(title, x, infoY);
        doc.moveTo(x, infoY + 14).lineTo(x + colW - 20, infoY + 14).strokeColor(gold).lineWidth(1).stroke();
      };

      drawHeaderLine(ML, "BILL TO");
      drawHeaderLine(ML + colW, "PAYMENT");

      // Bill To Content with wrapping
      doc.fontSize(9).fillColor(textDark).font("Helvetica-Bold").text(invoice.buyerName || "—", ML, infoY + 22);
      doc.fontSize(8.5).fillColor(textMid).font("Helvetica").text(invoice.buyerAddress || "—", ML, infoY + 34, { width: colW - 25 });

      // Payment Content
      let payY = infoY + 22;
      [{l: "Method", v: invoice.paymentMethod || "COD"}, {l: "Status", v: "SUCCESS"}, {l: "Txn ID", v: invoice.transactionId || "—"}].forEach(p => {
        doc.fontSize(8.5).fillColor(textMid).font("Helvetica").text(`${p.l}: `, ML + colW, payY, { continued: true })
           .fillColor(textDark).text(p.v);
        payY += 14;
      });

      /* ────── Items Table ────── */
      const tableY = infoY + 75;
      const tableCols = [
        { label: "Item", x: 0, w: 230, align: "left" },
        { label: "Qty", x: 230, w: 40, align: "center" },
        { label: "MRP (Inc.)", x: 270, w: 80, align: "right" },
        { label: "Taxable Val", x: 350, w: 80, align: "right" },
        { label: "GST", x: 430, w: 40, align: "right" },
        { label: "Total", x: 470, w: CW - 470, align: "right" }
      ];

      doc.rect(ML, tableY, CW, 22).fill(tableHead);
      tableCols.forEach(c => {
        doc.fontSize(8.5).fillColor(gold).font("Helvetica-Bold").text(c.label, ML + c.x + 5, tableY + 7, { width: c.w - 10, align: c.align });
      });

      let rowY = tableY + 22;
      (invoice.items || []).forEach((item, i) => {
        doc.rect(ML, rowY, CW, 24).fill(i % 2 === 0 ? "#FFFFFF" : "#FAF8F4");
        doc.fillColor(textDark).font("Helvetica").fontSize(8.5);
        
        doc.text(item.productName, ML + tableCols[0].x + 5, rowY + 8, { width: tableCols[0].w - 10 });
        doc.fillColor("#004488").text(item.qty, ML + tableCols[1].x, rowY + 8, { width: tableCols[1].w, align: "center" });
        doc.fillColor(textDark).text(`₹${(item.unitPrice || 0).toFixed(2)}`, ML + tableCols[2].x, rowY + 8, { width: tableCols[2].w - 5, align: "right" });
        doc.text(`₹${(item.taxableValue || 0).toFixed(2)}`, ML + tableCols[3].x, rowY + 8, { width: tableCols[3].w - 5, align: "right" });
        doc.text(`₹${((item.cgst || 0) + (item.sgst || 0)).toFixed(2)}`, ML + tableCols[4].x, rowY + 8, { width: tableCols[4].w - 5, align: "right" });
        doc.text(`₹${(item.finalPrice || 0).toFixed(2)}`, ML + tableCols[5].x, rowY + 8, { width: tableCols[5].w - 5, align: "right" });
        rowY += 24;
      });

      /* ────── Summary Box ────── */
      const sumY = rowY + 15;
      const sumW = 220;
      const sumX = ML + CW - sumW;

      doc.rect(sumX, sumY, sumW, 145).strokeColor(gold).lineWidth(1).stroke();
      doc.rect(sumX, sumY, sumW, 20).fill(burgundy);
      doc.fontSize(9).fillColor(gold).font("Helvetica-Bold").text("INVOICE SUMMARY", sumX + 10, sumY + 6);

      let subY = sumY + 28;
      const drawRow = (label, value, color = textDark, isBold = false) => {
        doc.fontSize(8.5).fillColor(textMid).font("Helvetica").text(label, sumX + 10, subY);
        doc.fillColor(color).font(isBold ? "Helvetica-Bold" : "Helvetica").text(`₹${value.toFixed(2)}`, sumX, subY, { width: sumW - 10, align: "right" });
        subY += 18;
      };

      drawRow("Item Total (Incl. GST)", invoice.subtotal || 0);
      drawRow("Less: Discount", Math.abs(invoice.discount || 0), "#CC3300");
      
      doc.moveTo(sumX + 10, subY - 4).lineTo(sumX + sumW - 10, subY - 4).strokeColor("#E0E0E0").lineWidth(0.5).stroke();

      drawRow("Taxable Value (Base)", invoice.taxableValue || 0, textDark, true);
      drawRow("CGST", invoice.cgst || 0);
      drawRow("SGST", invoice.sgst || 0);

      doc.rect(sumX, sumY + 115, sumW, 30).fill(burgundy);
      doc.fontSize(9).fillColor(gold).font("Helvetica-Bold").text("NET AMOUNT PAYABLE", sumX + 10, sumY + 126);
      doc.fontSize(11).text(`₹${(invoice.totalPaid || 0).toFixed(2)}`, sumX, sumY + 125, { width: sumW - 10, align: "right" });

      // Amount in Words
      doc.fontSize(7.5).fillColor("#999999").font("Helvetica-Bold").text("AMOUNT IN WORDS:", ML, sumY + 10);
      doc.fontSize(9).fillColor(textDark).text(numberToWords(invoice.totalPaid), ML, sumY + 22);

      /* ────── Footer ────── */
      doc.fontSize(8).fillColor("#999999").font("Helvetica")
         .text("Digitally generated for Gopi Nath Collection. No signature required.", 0, PH - 60, { align: "center", width: PW });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};