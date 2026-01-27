import CreditNote from "../Models/creditNoteModel.js";
import Invoice from "../Models/invoiceModel.js";

/**
 * Generate Credit Note
 * Triggered when: Order is CANCELLED or RETURNED
 */
export const generateCreditNote = async (req, res) => {
  try {
    const { invoiceId, reason, returnedItems } = req.body; 

    // 1. Fetch original Invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 2. Logic for Full vs Partial Credit
    // If 'CANCELLED', we usually credit the whole invoice.
    // If 'RETURNED', we credit only specific items.
    const itemsToCredit = reason === "CANCELLED" ? invoice.items : returnedItems;

    let totalTaxable = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalCredit = 0;

    const creditItems = itemsToCredit.map(item => {
      // Logic: Extract tax values from the original invoice item matching this productId
      const originalItem = invoice.items.find(i => i.productId.toString() === item.productId.toString());
      
      if (!originalItem) return null;

      // Calculate ratio if returning fewer quantities than invoiced
      const qtyRatio = item.qty / originalItem.qty;

      const itemTaxable = +(originalItem.taxableValue * qtyRatio).toFixed(2);
      const itemCGST = +(originalItem.cgst * qtyRatio).toFixed(2);
      const itemSGST = +(originalItem.sgst * qtyRatio).toFixed(2);
      const itemIGST = +(originalItem.igst * qtyRatio).toFixed(2);
      const itemTotal = +(originalItem.finalPrice * qtyRatio).toFixed(2);

      totalTaxable += itemTaxable;
      totalCGST += itemCGST;
      totalSGST += itemSGST;
      totalIGST += itemIGST;
      totalCredit += itemTotal;

      return {
        productId: item.productId,
        qty: item.qty,
        taxableValue: itemTaxable,
        cgst: itemCGST,
        sgst: itemSGST,
        igst: itemIGST
      };
    }).filter(Boolean);

    // 3. Create unique Credit Note Number
    const creditNoteNumber = `CN-${Date.now()}`; // Or use your generateInvoiceNumber helper logic

    const creditNote = await CreditNote.create({
      invoiceId,
      creditNoteNumber,
      reason,
      taxableValue: totalTaxable,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      totalCredit: totalCredit,
      items: creditItems
    });

    return res.status(201).json({
      message: "Credit Note generated successfully",
      creditNote
    });

  } catch (error) {
    console.error("Credit Note Error:", error);
    return res.status(500).json({ message: "Failed to generate credit note" });
  }
};