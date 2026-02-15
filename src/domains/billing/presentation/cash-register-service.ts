import type { InventoryItem } from "@/lib/types"
import { computeCashRegisterSaleMetrics } from "@/src/domains/billing/domain/transaction-rules"

export function buildSaleMetrics(quantity: number, customPrice: number | null, retailPricePerGram: number, inventory: InventoryItem | null) {
  return computeCashRegisterSaleMetrics({
    quantityGrams: quantity,
    customPrice,
    retailPricePerGram,
    inventory,
  })
}
