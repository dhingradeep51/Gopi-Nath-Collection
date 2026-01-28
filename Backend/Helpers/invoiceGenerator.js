import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = async (invoice) => {
  let browser;
  try {
    // 1. Setup local storage directory (Render disk is ephemeral, but works for temp files)
    const dir = path.join(process.cwd(), "uploads", "invoices");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${invoice.invoiceNumber.replace(/\//g, "-")}.pdf`;
    const filePath = path.join(dir, filename);

    // 2. Launch Puppeteer (no executablePath needed with full puppeteer)
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--single-process",
        "--no-zygote"
      ],
    });

    const page = await browser.newPage();

    // 3. Define Invoice HTML Template
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Segoe UI', sans-serif; font-size: 12px; color: #333; line-height: 1.6; }
        .container { padding: 30px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-bottom: 20px; }
        .seller-info h1 { color: #2D0A14; margin: 0; font-size: 24px; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .box { width: 48%; }
        .box h3 { color: #2D0A14; border-bottom: 1px solid #D4AF37; font-size: 13px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #2D0A14; color: #D4AF37; padding: 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        .math-summary { margin-top: 20px; display: flex; justify-content: flex-end; }
        .summary-table { width: 320px; background: #fdfaf0; border: 1px solid #D4AF37; }
        .summary-table td { border: none; padding: 5px 10px; }
        .total-row { background: #2D0A14; color: #D4AF37; font-weight: bold; font-size: 14px; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="seller-info">
            <h1>${invoice.sellerName}</h1>
            <p>${invoice.sellerAddress}<br><strong>GSTIN:</strong> ${invoice.sellerGstin}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="color: #D4AF37; margin:0;">TAX INVOICE</h2>
            <p>Inv: ${invoice.invoiceNumber}<br>Order: ${invoice.orderNumber}</p>
          </div>
        </div>
        <div class="details-row">
          <div class="box">
            <h3>BILL TO</h3>
            <p><strong>${invoice.buyerName}</strong><br>${invoice.buyerAddress}</p>
          </div>
          <div class="box">
            <h3>PAYMENT</h3>
            <p>Method: ${invoice.paymentMethod}<br>Status: SUCCESS</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>MRP (Inc.)</th>
              <th>Taxable Val</th>
              <th>GST</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.qty}</td>
                <td>₹${item.unitPrice.toFixed(2)}</td>
                <td>₹${item.taxableValue.toFixed(2)}</td>
                <td>₹${(item.cgst + item.sgst + item.igst).toFixed(2)}</td>
                <td>₹${item.finalPrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="math-summary">
          <table class="summary-table">
            <tr>
              <td>Item Total (Incl. GST)</td>
              <td style="text-align: right;">₹${invoice.subtotal.toFixed(2)}</td>
            </tr>
            ${invoice.discount > 0 ? `
            <tr>
              <td style="color: #c0392b;">Less: Discount</td>
              <td style="text-align: right; color: #c0392b;">- ₹${invoice.discount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td>Shipping Fee</td>
              <td style="text-align: right;">₹${invoice.shippingCharges.toFixed(2)}</td>
            </tr>
            <tr style="border-top: 1px solid #D4AF37;">
              <td><strong>Taxable Value (Base)</strong></td>
              <td style="text-align: right;">₹${invoice.taxableValue.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total GST (${invoice.gstType})</strong></td>
              <td style="text-align: right;">₹${(invoice.cgst + invoice.sgst + invoice.igst).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>NET AMOUNT PAYABLE</td>
              <td style="text-align: right;">₹${invoice.totalPaid.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        <div class="footer">
          <p>Digitally generated for Gopi Nath Collection. No signature required.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    // 4. Generate PDF
    const pdfBuffer = await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true
    });

    return pdfBuffer;

  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};