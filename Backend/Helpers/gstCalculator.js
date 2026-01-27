/**
 * GST Calculator (GST-INCLUSIVE pricing)
 * Supports product-wise GST rates: 0 / 5 / 12 / 18
 */
export const calculateGST = ({
  totalPaid,
  sellerState,
  buyerState,
  gstRate
}) => {
  if (!totalPaid || totalPaid <= 0) {
    return {
      gstType: "CGST_SGST",
      taxableValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalGST: 0,
      appliedRate: gstRate || 0
    };
  }

  const rate = Number(gstRate || 0);
  const rateDecimal = rate / 100;

  // Back-calculate taxable value from GST-inclusive price
  const taxableValue = +(totalPaid / (1 + rateDecimal)).toFixed(2);
  const totalGST = +(totalPaid - taxableValue).toFixed(2);

  const normalize = (s) => (s || "").trim().toLowerCase();
  const isSameState =
    normalize(sellerState) === "haryana" &&
    (normalize(buyerState) === "haryana" || normalize(buyerState) === "chandigarh");

  if (isSameState) {
    const cgst = +(totalGST / 2).toFixed(2);
    const sgst = +(totalGST - cgst).toFixed(2);

    return {
      gstType: "CGST_SGST",
      taxableValue,
      cgst,
      sgst,
      igst: 0,
      totalGST,
      appliedRate: rate
    };
  }

  return {
    gstType: "IGST",
    taxableValue,
    cgst: 0,
    sgst: 0,
    igst: totalGST,
    totalGST,
    appliedRate: rate
  };
};
