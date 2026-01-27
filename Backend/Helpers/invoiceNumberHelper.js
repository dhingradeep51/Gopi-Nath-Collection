import Counter from "../Models/counterModel.js";

/**
 * Get Financial Year in format: 25-26
 */
const getFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 4) {
    return `${year % 100}-${(year + 1) % 100}`;
  } else {
    return `${(year - 1) % 100}-${year % 100}`;
  }
};

/**
 * Generate GST-compliant Invoice Number
 * Format: INV/25-26/000001
 */
export const generateInvoiceNumber = async () => {
  const fy = getFinancialYear();
  const counterKey = `invoice_${fy}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(6, "0");
  return `INV/${fy}/${paddedSeq}`;
};
