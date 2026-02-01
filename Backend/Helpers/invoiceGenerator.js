import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// ─── Helper: convert number to Indian-style words ────────────────────────────
const numberToWords = (num) => {
  if (!num || num === 0) return "Zero";
  num = Math.round(num);

  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens  = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

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
      /* ────── file setup ────── */
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

      /* ────── brand palette ────── */
      const gold       = "#D4AF37";
      const goldLight  = "#F0D26A";
      const burgundy   = "#2D0A14";
      const darkBg     = "#1a1018";     // header / footer bg
      const cream      = "#FDF8F0";     // page bg
      const tableHead  = "#2D0A14";
      const rowEven    = "#FFFFFF";
      const rowOdd     = "#FAF5EE";
      const textDark   = "#2C2C2C";
      const textMid    = "#5A5A5A";
      const textLight  = "#888888";

      /* ────── page dimensions ────── */
      const PW = 595.28;   // A4 width  in pts
      const PH = 841.89;   // A4 height in pts
      const ML = 42;       // margin left
      const MR = 42;       // margin right
      const CW = PW - ML - MR; // content width

      /* ════════════════════════════════════════════════════
         BACKGROUND
      ════════════════════════════════════════════════════ */
      doc.rect(0, 0, PW, PH).fill(cream);

      /* ════════════════════════════════════════════════════
         TOP HEADER BAR  (dark burgundy strip)
      ════════════════════════════════════════════════════ */
      const hdrH = 110;
      doc.rect(0, 0, PW, hdrH).fill(darkBg);

      // thin gold accent line under header
      doc.rect(0, hdrH, PW, 3).fill(gold);

      // Brand name
      doc.fontSize(24).fillColor("#FFFFFF").font("Helvetica-Bold")
        .text("GOPI NATH", ML, 22, { lineBreak: false });
      doc.fontSize(11).fillColor(gold).font("Helvetica")
        .text("COLLECTION", ML, 44, { lineBreak: false });

      // Decorative gold line under brand
      doc.moveTo(ML, 58).lineTo(ML + 80, 58).strokeColor(gold).lineWidth(1.5).stroke();

      // Address block (left, below brand)
      doc.fontSize(7.5).fillColor("#AAAAAA").font("Helvetica")
        .text("56 Krishna Nagar, New Model Town", ML, 64, { lineBreak: false })
        .text("Panipat, Haryana – 132103", ML, 74, { lineBreak: false })
        .text(`GSTIN: ${invoice.sellerGstin || "YOUR_GSTIN_HERE"}`, ML, 84, { lineBreak: false });

      // Right side — invoice title + numbers
      doc.fontSize(18).fillColor(gold).font("Helvetica-Bold")
        .text("TAX INVOICE", { align: "right", lineBreak: false }, ML, 18, { width: CW });

      doc.fontSize(8).fillColor("#CCCCCC").font("Helvetica")
        .text(`Invoice No : ${invoice.invoiceNumber || ""}`, { align: "right" }, ML, 48, { width: CW })
        .text(`Order No   : ${invoice.orderNumber || ""}`, { align: "right" }, ML, 58, { width: CW })
        .text(`Date       : ${invoice.date || new Date().toLocaleDateString("en-IN")}`, { align: "right" }, ML, 68, { width: CW });

      /* ════════════════════════════════════════════════════
         BILLING  |  SHIPPING  |  PAYMENT  — 3-col row
      ════════════════════════════════════════════════════ */
      const infoY      = hdrH + 16;
      const colW       = CW / 3;
      const infoBoxH   = 105;

      // ── column borders (subtle) ──
      [1, 2].forEach((i) => {
        doc.moveTo(ML + colW * i, infoY)
           .lineTo(ML + colW * i, infoY + infoBoxH)
           .strokeColor("#E0D8CE").lineWidth(0.6).stroke();
      });

      // ── bottom border ──
      doc.moveTo(ML, infoY + infoBoxH)
         .lineTo(ML + CW, infoY + infoBoxH)
         .strokeColor("#E0D8CE").lineWidth(0.6).stroke();

      const writeInfoBlock = (x, w, title, lines) => {
        // title
        doc.fontSize(8).fillColor(gold).font("Helvetica-Bold")
          .text(title, x + 10, infoY + 6, { width: w - 16, lineBreak: false });
        // gold underline
        doc.moveTo(x + 10, infoY + 16).lineTo(x + w - 10, infoY + 16)
           .strokeColor(gold).lineWidth(0.7).stroke();
        // lines
        let ly = infoY + 21;
        lines.forEach(({ label, value }) => {
          doc.fontSize(7.5).fillColor(textMid).font("Helvetica-Bold")
            .text(label, x + 10, ly, { lineBreak: false });
          doc.fontSize(7.5).fillColor(textDark).font("Helvetica")
            .text(value || "—", x + 10 + doc.widthOfString(label) + 4, ly, { lineBreak: false });
          ly += 13;
        });
      };

      writeInfoBlock(ML, colW, "BILL TO", [
        { label: "Name: ",    value: invoice.buyerName || "—" },
        { label: "Address: ", value: invoice.buyerAddress || "—" },
        { label: "City: ",    value: invoice.buyerCity || "—" },
        { label: "State: ",   value: invoice.buyerState || "—" },
        { label: "PIN: ",     value: invoice.buyerPin || "—" },
        { label: "Phone: ",   value: invoice.buyerPhone || "—" },
      ]);

      writeInfoBlock(ML + colW, colW, "SHIP TO", [
        { label: "Name: ",    value: invoice.shipName || invoice.buyerName || "—" },
        { label: "Address: ", value: invoice.shipAddress || invoice.buyerAddress || "—" },
        { label: "City: ",    value: invoice.shipCity || invoice.buyerCity || "—" },
        { label: "State: ",   value: invoice.shipState || invoice.buyerState || "—" },
        { label: "PIN: ",     value: invoice.shipPin || invoice.buyerPin || "—" },
        { label: "Phone: ",   value: invoice.shipPhone || invoice.buyerPhone || "—" },
      ]);

      writeInfoBlock(ML + colW * 2, colW, "PAYMENT", [
        { label: "Method: ", value: invoice.paymentMethod || "COD" },
        { label: "Status: ", value: "SUCCESS" },
        { label: "Txn ID: ", value: invoice.transactionId || "—" },
      ]);

      /* ════════════════════════════════════════════════════
         ITEMS TABLE
      ════════════════════════════════════════════════════ */
      const tableY = infoY + infoBoxH + 18;

      // column definitions  { key, label, x (relative to ML), w, align }
      const cols = [
        { label: "#",          x: 0,     w: 28,  align: "center" },
        { label: "ITEM",       x: 28,    w: 180, align: "left"   },
        { label: "QTY",        x: 208,   w: 40,  align: "center" },
        { label: "MRP (₹)",   x: 248,   w: 58,  align: "right"  },
        { label: "TAXABLE (₹)",x: 306,   w: 68,  align: "right"  },
        { label: "GST (₹)",   x: 374,   w: 58,  align: "right"  },
        { label: "TOTAL (₹)", x: 432,   w: CW - 432, align: "right" },
      ];

      const thH = 22;   // header row height
      const trH = 21;   // data row height

      // ── Header row ──
      doc.rect(ML, tableY, CW, thH).fill(tableHead);
      cols.forEach((c) => {
        doc.fontSize(7.5).fillColor("#FFFFFF").font("Helvetica-Bold")
          .text(c.label, ML + c.x + (c.align === "right" ? c.w - 6 : c.align === "center" ? 0 : 6),
                tableY + 7,
                { width: c.w, align: c.align, lineBreak: false });
      });

      // ── Data rows ──
      const items = invoice.items || [];
      let rowY = tableY + thH;

      items.forEach((item, i) => {
        const bg = i % 2 === 0 ? rowEven : rowOdd;
        doc.rect(ML, rowY, CW, trH).fill(bg);

        const totalGst = (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0);
        const values = [
          String(i + 1),
          item.productName || "",
          String(item.qty || 0),
          `${(item.unitPrice || 0).toFixed(2)}`,
          `${(item.taxableValue || 0).toFixed(2)}`,
          `${totalGst.toFixed(2)}`,
          `${(item.finalPrice || 0).toFixed(2)}`,
        ];

        cols.forEach((c, ci) => {
          doc.fontSize(7.8).fillColor(textDark).font("Helvetica")
            .text(values[ci], ML + c.x + (c.align === "right" ? c.w - 6 : c.align === "center" ? 0 : 6),
                  rowY + 7,
                  { width: c.w, align: c.align, lineBreak: false });
        });

        rowY += trH;
      });

      // ── bottom border of table ──
      doc.moveTo(ML, rowY).lineTo(ML + CW, rowY).strokeColor("#D5CBBD").lineWidth(0.8).stroke();

      /* ════════════════════════════════════════════════════
         SUMMARY + TERMS  (side by side below table)
      ════════════════════════════════════════════════════ */
      const sumY      = rowY + 18;
      const sumW      = 240;                // summary box width
      const sumX      = ML + CW - sumW;     // pushed right
      const termsW    = CW - sumW - 16;     // terms column width

      // ── Terms & Conditions (left) ──
      doc.fontSize(7.5).fillColor(gold).font("Helvetica-Bold")
        .text("TERMS & CONDITIONS", ML, sumY, { lineBreak: false });
      doc.moveTo(ML, sumY + 11).lineTo(ML + termsW, sumY + 11)
         .strokeColor(gold).lineWidth(0.7).stroke();

      const terms = invoice.terms || [
        "1. Goods once sold will not be taken back or exchanged.",
        "2. All disputes are subject to local jurisdiction.",
        "3. Payment is due within 30 days of invoice date.",
        "4. GST is applicable as per prevailing rates.",
        "5. Seller is not responsible for transit damages.",
      ];
      let tY = sumY + 16;
      terms.forEach((t) => {
        doc.fontSize(6.8).fillColor(textMid).font("Helvetica")
          .text(t, ML, tY, { width: termsW, lineBreak: true });
        tY += 11;
      });

      // ── Summary Box (right) ──
      // outer border
      doc.rect(sumX, sumY, sumW, 140).strokeColor(gold).lineWidth(1).stroke();
      // top accent bar
      doc.rect(sumX, sumY, sumW, 20).fill(burgundy);
      doc.fontSize(8.5).fillColor(gold).font("Helvetica-Bold")
        .text("INVOICE SUMMARY", sumX + 12, sumY + 6, { lineBreak: false });

      const sRows = [
        { label: "Subtotal (Incl. GST)",   value: invoice.subtotal || 0,         color: textDark, bold: false },
        { label: "Discount",               value: -(invoice.discount || 0),      color: "#e74c3c", bold: false, prefix: "- " },
        { label: "Shipping Fee",           value: invoice.shippingCharges || 0,  color: textDark, bold: false },
      ];

      let sY = sumY + 28;
      const sRowH = 17;

      sRows.forEach((r, i) => {
        // subtle separator
        if (i > 0) {
          doc.moveTo(sumX + 10, sY - 2).lineTo(sumX + sumW - 10, sY - 2)
             .strokeColor("#EEE9E0").lineWidth(0.5).stroke();
        }
        doc.fontSize(7.5).fillColor(textMid).font("Helvetica")
          .text(r.label, sumX + 12, sY, { lineBreak: false });
        const valStr = r.prefix
          ? `${r.prefix}₹${Math.abs(r.value).toFixed(2)}`
          : `₹${r.value.toFixed(2)}`;
        doc.fontSize(7.5).fillColor(r.color).font(r.bold ? "Helvetica-Bold" : "Helvetica")
          .text(valStr, sumX + 12, sY, { width: sumW - 24, align: "right", lineBreak: false });
        sY += sRowH;
      });

      // divider before tax rows
      doc.moveTo(sumX + 10, sY).lineTo(sumX + sumW - 10, sY)
         .strokeColor(gold).lineWidth(0.8).stroke();
      sY += 6;

      // Tax detail rows
      const taxRows = [
        { label: "Taxable Value (Base)", value: invoice.taxableValue || 0 },
        { label: "CGST",                value: invoice.cgst || 0 },
        { label: "SGST",                value: invoice.sgst || 0 },
        { label: "IGST",                value: invoice.igst || 0 },
      ];

      taxRows.forEach((r) => {
        if (r.value === 0) return; // skip zero-value rows
        doc.fontSize(7).fillColor(textMid).font("Helvetica")
          .text(r.label, sumX + 12, sY, { lineBreak: false });
        doc.fontSize(7).fillColor(textDark).font("Helvetica")
          .text(`₹${r.value.toFixed(2)}`, sumX + 12, sY, { width: sumW - 24, align: "right", lineBreak: false });
        sY += 13;
      });

      // ── NET PAYABLE banner ──
      const bannerY = sumY + 140 - 28;
      doc.rect(sumX, bannerY, sumW, 28).fill(burgundy);
      doc.moveTo(sumX, bannerY).lineTo(sumX + sumW, bannerY).strokeColor(gold).lineWidth(1.5).stroke();

      doc.fontSize(8).fillColor("#FFFFFF").font("Helvetica-Bold")
        .text("NET AMOUNT PAYABLE", sumX + 12, bannerY + 5, { lineBreak: false });
      doc.fontSize(13).fillColor(gold).font("Helvetica-Bold")
        .text(`₹${(invoice.totalPaid || 0).toFixed(2)}`, sumX + 12, bannerY + 15,
              { width: sumW - 24, align: "right", lineBreak: false });

      /* ════════════════════════════════════════════════════
         AMOUNT IN WORDS
      ════════════════════════════════════════════════════ */
      const amtY = sumY + 155;
      doc.rect(ML, amtY, CW, 28).fill("#F5F0E8").strokeColor("#E0D8CE").lineWidth(0.6).stroke();
      doc.fontSize(7).fillColor(textMid).font("Helvetica-Bold")
        .text("AMOUNT IN WORDS:", ML + 10, amtY + 5, { lineBreak: false });
      doc.fontSize(7.8).fillColor(burgundy).font("Helvetica-Bold")
        .text(`₹ ${numberToWords(invoice.totalPaid || 0)}`, ML + 10, amtY + 15, { lineBreak: false });

      /* ════════════════════════════════════════════════════
         FOOTER BAR
      ════════════════════════════════════════════════════ */
      const ftrY = PH - 52;
      doc.rect(0, ftrY, PW, 52).fill(darkBg);
      doc.rect(0, ftrY, PW, 2.5).fill(gold);   // gold accent top

      // Left — Thank you
      doc.fontSize(9).fillColor(gold).font("Helvetica-Bold")
        .text("Thank you for your business!", ML, ftrY + 12, { lineBreak: false });
      doc.fontSize(6.5).fillColor("#888888").font("Helvetica")
        .text("www.gopinathcollection.com  |  support@gopinathcollection.com", ML, ftrY + 24, { lineBreak: false });

      // Right — page indicator
      doc.fontSize(7).fillColor("#666666").font("Helvetica")
        .text("Page 1 of 1", { align: "right" }, ML, ftrY + 38, { width: CW });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};