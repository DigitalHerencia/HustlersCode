export function deriveCustomerStatus(amountOwed: number, paymentAmount: number): "paid" | "partial" | "unpaid" {
  if (amountOwed <= 0) return "paid"
  if (paymentAmount > 0) return "partial"
  return "unpaid"
}

export function applyPaymentToBalance(currentAmountOwed: number, paymentAmount: number) {
  return Math.max(0, currentAmountOwed - paymentAmount)
}
