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
      const MR = 42;
      const CW = PW - ML - MR;

      /* ── Background ── */
      doc.rect(0, 0, PW, PH).fill(cream);

      /* ────── Top Header ────── */
      const hdrH = 110;
      doc.rect(0, 0, PW, hdrH).fill(darkBg);
      doc.rect(0, hdrH, PW, 3).fill(gold);

      doc.fontSize(24).fillColor("#FFFFFF").font("Helvetica-Bold").text("GOPI NATH", ML, 25);
      doc.fontSize(11).fillColor(gold).font("Helvetica").text("COLLECTION", ML, 48);
      
      doc.fontSize(8).fillColor("#AAAAAA")
        .text("56 Krishna Nagar, New Model Town", ML, 68)
        .text("Panipat, Haryana – 132103", ML, 78)
        .text(`GSTIN: ${invoice.sellerGstin || "GST-PENDING"}`, ML, 88);

      doc.fontSize(18).fillColor(gold).font("Helvetica-Bold").text("TAX INVOICE", ML, 25, { align: "right", width: CW });
      doc.fontSize(8).fillColor("#CCCCCC").font("Helvetica")
        .text(`Invoice No: ${invoice.invoiceNumber || "N/A"}`, ML, 55, { align: "right", width: CW })
        .text(`Order No: ${invoice.orderNumber || "N/A"}`, ML, 65, { align: "right", width: CW })
        .text(`Date: ${invoice.date || new Date().toLocaleDateString("en-IN")}`, ML, 75, { align: "right", width: CW });

      /* ────── Billing & Shipping Info ────── */
      const infoY = hdrH + 25;
      const colW = CW / 3;

      const writeInfo = (x, title, lines) => {
        doc.fontSize(9).fillColor(gold).font("Helvetica-Bold").text(title, x, infoY);
        doc.moveTo(x, infoY + 12).lineTo(x + colW - 15, infoY + 12).strokeColor(gold).lineWidth(1).stroke();
        let ly = infoY + 20;
        lines.forEach(l => {
          doc.fontSize(8).fillColor(textMid).font("Helvetica-Bold").text(`${l.label}: `, x, ly, { continued: true })
             .fillColor(textDark).font("Helvetica").text(l.value || "—");
          ly += 14; // Increased leading to prevent overlapping
        });
      };

      writeInfo(ML, "BILL TO", [
        { label: "Name", value: invoice.buyerName },
        { label: "Address", value: invoice.buyerAddress },
        { label: "State", value: invoice.buyerState }
      ]);
      writeInfo(ML + colW, "SHIP TO", [
        { label: "Name", value: invoice.shipName || invoice.buyerName },
        { label: "Address", value: invoice.shipAddress || invoice.buyerAddress },
        { label: "State", value: invoice.shipState || invoice.buyerState }
      ]);
      writeInfo(ML + (colW * 2), "PAYMENT", [
        { label: "Method", value: invoice.paymentMethod || "COD" },
        { label: "Status", value: "SUCCESS" },
        { label: "Txn ID", value: invoice.transactionId || "—" }
      ]);

      /* ────── Items Table ────── */
      const tableY = infoY + 85;
      const cols = [
        { label: "#", x: 0, w: 30, align: "center" },
        { label: "ITEM", x: 30, w: 200, align: "left" },
        { label: "QTY", x: 230, w: 40, align: "center" },
        { label: "MRP", x: 270, w: 70, align: "right" },
        { label: "TAXABLE", x: 340, w: 80, align: "right" },
        { label: "GST", x: 420, w: CW - 420, align: "right" }
      ];

      doc.rect(ML, tableY, CW, 22).fill(tableHead);
      cols.forEach(c => {
        doc.fontSize(8).fillColor("#FFFFFF").font("Helvetica-Bold").text(c.label, ML + c.x, tableY + 7, { width: c.w, align: c.align });
      });

      let rowY = tableY + 22;
      (invoice.items || []).forEach((item, i) => {
        doc.rect(ML, rowY, CW, 20).fill(i % 2 === 0 ? "#FFFFFF" : "#FAF5EE");
        doc.fillColor(textDark).fontSize(8).font("Helvetica");
        doc.text(i + 1, ML + cols[0].x, rowY + 6, { width: cols[0].w, align: "center" });
        doc.text(item.productName, ML + cols[1].x + 5, rowY + 6, { width: cols[1].w });
        doc.text(item.qty, ML + cols[2].x, rowY + 6, { width: cols[2].w, align: "center" });
        doc.text((item.unitPrice || 0).toFixed(2), ML + cols[3].x, rowY + 6, { width: cols[3].w - 5, align: "right" });
        doc.text((item.taxableValue || 0).toFixed(2), ML + cols[4].x, rowY + 6, { width: cols[4].w - 5, align: "right" });
        doc.text(((item.cgst || 0) + (item.sgst || 0)).toFixed(2), ML + cols[5].x, rowY + 6, { width: cols[5].w - 5, align: "right" });
        rowY += 20;
      });

      /* ────── Summary & Net Payable ────── */
      const sumY = rowY + 25;
      const sumW = 220;
      const sumX = ML + CW - sumW;

      doc.rect(sumX, sumY, sumW, 115).strokeColor(gold).lineWidth(1).stroke();
      doc.rect(sumX, sumY, sumW, 22).fill(burgundy);
      doc.fontSize(9).fillColor(gold).font("Helvetica-Bold").text("INVOICE SUMMARY", sumX + 10, sumY + 7);

      const sRows = [
        { label: "Subtotal (Incl. GST)", value: invoice.totalPaid || 0 },
        { label: "Discount", value: -(invoice.discount || 0) },
        { label: "Shipping Fee", value: invoice.shippingCharges || 0 }
      ];
      let subY = sumY + 32;
      sRows.forEach(r => {
        doc.fontSize(8).fillColor(textMid).font("Helvetica").text(r.label, sumX + 10, subY);
        doc.fillColor(textDark).text(`₹${r.value.toFixed(2)}`, sumX, subY, { width: sumW - 10, align: "right" });
        subY += 16;
      });

      doc.rect(sumX, sumY + 87, sumW, 28).fill(burgundy);
      doc.fontSize(9).fillColor("#FFFFFF").text("NET PAYABLE", sumX + 10, sumY + 97);
      doc.fontSize(11).fillColor(gold).text(`₹${(invoice.totalPaid || 0).toFixed(2)}`, sumX, sumY + 95, { width: sumW - 10, align: "right" });

      /* ────── Amount in Words ────── */
      const wordsY = sumY + 70;
      doc.rect(ML, wordsY, CW - sumW - 20, 45).fill("#F5F0E8");
      doc.fontSize(8).fillColor(textMid).font("Helvetica-Bold").text("AMOUNT IN WORDS:", ML + 10, wordsY + 10);
      doc.fontSize(9).fillColor(burgundy).text(numberToWords(invoice.totalPaid), ML + 10, wordsY + 25);

      /* ────── Footer ────── */
      const ftrY = PH - 65;
      doc.rect(0, ftrY, PW, 65).fill(darkBg);
      doc.rect(0, ftrY, PW, 2.5).fill(gold);

      doc.fontSize(8.5).fillColor(gold).font("Helvetica-Bold")
         .text("This is a system generated invoice and does not require a physical signature.", 0, ftrY + 20, { align: "center", width: PW });
      doc.fontSize(7).fillColor("#888888").font("Helvetica")
         .text("www.gopinathcollection.com  |  support@gopinathcollection.com", 0, ftrY + 40, { align: "center", width: PW });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};