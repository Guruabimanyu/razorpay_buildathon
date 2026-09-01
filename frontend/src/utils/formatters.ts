/**
 * Formats monetary amounts in Indian Rupee format cleanly:
 * - >= ₹1 Cr (₹1,00,00,000) -> "₹1.54 Cr"
 * - >= ₹1 Lakh (₹1,00,000) -> "₹4.85 Lakhs"
 * - < ₹1 Lakh -> "₹50,000"
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const absAmt = Math.abs(amount);
  const prefix = amount < 0 ? '-₹' : '₹';

  if (absAmt >= 10000000) {
    const cr = absAmt / 10000000;
    return `${prefix}${cr.toFixed(2)} Cr`;
  } else if (absAmt >= 100000) {
    const lakhs = absAmt / 100000;
    return `${prefix}${lakhs.toFixed(2)} Lakhs`;
  } else {
    return `${prefix}${absAmt.toLocaleString('en-IN')}`;
  }
}

export function formatCompactNumber(val: number): string {
  return formatCurrency(val);
}
