import type { InventoryItem } from "@/lib/types"

export function computeCashRegisterSaleMetrics(params: {
  quantityGrams: number
  retailPricePerGram: number
  customPrice: number | null
  inventory: InventoryItem | null
}) {
  const totalPrice = params.customPrice ?? params.retailPricePerGram * params.quantityGrams
  const costPerGram = params.inventory ? params.inventory.costPerOz / 28.35 : 0
  const cost = costPerGram * params.quantityGrams
  const profit = totalPrice - cost

  return {
    totalPrice,
    pricePerGram: totalPrice / params.quantityGrams,
    cost,
    profit,
  }
}
