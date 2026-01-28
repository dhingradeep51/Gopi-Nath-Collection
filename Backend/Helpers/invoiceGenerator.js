import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure uploads/invoices directory exists
      const dir = path.join(process.cwd(), "uploads", "invoices");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filename = `${invoice.invoiceNumber.replace(/\//g, "-")}.pdf`;
      const filePath = path.join(dir, filename);

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        fs.writeFileSync(filePath, pdfBuffer); // optional persistence
        resolve(pdfBuffer);
      });

      /* ---------- HEADER ---------- */
      doc
        .fontSize(20)
        .fillColor("#2D0A14")
        .text(invoice.sellerName, { align: "left" });

      doc
        .fontSize(10)
        .fillColor("black")
        .text(`${invoice.sellerAddress}`)
        .text(`GSTIN: ${invoice.sellerGstin}`)
        .moveDown();

      doc
        .fontSize(16)
        .fillColor("#D4AF37")
        .text("TAX INVOICE", { align: "right" });

      doc
        .fontSize(10)
        .fillColor("black")
        .text(`Invoice: ${invoice.invoiceNumber}`, { align: "right" })
        .text(`Order: ${invoice.orderNumber}`, { align: "right" })
        .moveDown(2);

      /* ---------- BILL TO ---------- */
      doc.fontSize(12).text("BILL TO", { underline: true });
      doc.fontSize(10);
      doc.text(invoice.buyerName);
      doc.text(invoice.buyerAddress);
      doc.moveDown();

      /* ---------- PAYMENT ---------- */
      doc.fontSize(12).text("PAYMENT", { underline: true });
      doc.fontSize(10);
      doc.text(`Method: ${invoice.paymentMethod}`);
      doc.text("Status: SUCCESS");
      doc.moveDown(2);

      /* ---------- TABLE HEADER ---------- */
      const tableTop = doc.y;
      const colX = [40, 200, 240, 300, 370, 450];

      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Item", colX[0], tableTop);
      doc.text("Qty", colX[1], tableTop);
      doc.text("MRP", colX[2], tableTop);
      doc.text("Taxable", colX[3], tableTop);
      doc.text("GST", colX[4], tableTop);
      doc.text("Total", colX[5], tableTop);

      doc.moveDown(0.5);
      doc.font("Helvetica");

      /* ---------- TABLE ROWS ---------- */
      invoice.items.forEach((item) => {
        const y = doc.y;
        doc.text(item.productName, colX[0], y, { width: 150 });
        doc.text(item.qty, colX[1], y);
        doc.text(`₹${item.unitPrice.toFixed(2)}`, colX[2], y);
        doc.text(`₹${item.taxableValue.toFixed(2)}`, colX[3], y);
        doc.text(
          `₹${(item.cgst + item.sgst + item.igst).toFixed(2)}`,
          colX[4],
          y
        );
        doc.text(`₹${item.finalPrice.toFixed(2)}`, colX[5], y);
        doc.moveDown();
      });

      doc.moveDown(2);

      /* ---------- SUMMARY ---------- */
      doc.font("Helvetica-Bold");
      doc.text(`Item Total: ₹${invoice.subtotal.toFixed(2)}`, {
        align: "right",
      });

      if (invoice.discount > 0) {
        doc
          .fillColor("red")
          .text(`Discount: -₹${invoice.discount.toFixed(2)}`, {
            align: "right",
          })
          .fillColor("black");
      }

      doc.text(`Shipping Fee: ₹${invoice.shippingCharges.toFixed(2)}`, {
        align: "right",
      });

      doc.text(`Taxable Value: ₹${invoice.taxableValue.toFixed(2)}`, {
        align: "right",
      });

      doc.text(
        `Total GST (${invoice.gstType}): ₹${(
          invoice.cgst +
          invoice.sgst +
          invoice.igst
        ).toFixed(2)}`,
        { align: "right" }
      );

      doc
        .fontSize(14)
        .fillColor("#2D0A14")
        .text(`NET AMOUNT PAYABLE: ₹${invoice.totalPaid.toFixed(2)}`, {
          align: "right",
        });

      doc.moveDown(2);

      /* ---------- FOOTER ---------- */
      doc
        .fontSize(9)
        .fillColor("gray")
        .text(
          "Digitally generated for Gopi Nath Collection. No signature required.",
          { align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
