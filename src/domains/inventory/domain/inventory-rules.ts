import type { InventoryItem } from "@/lib/types"

const GRAMS_PER_OUNCE = 28.3495

export function recalculateInventoryQuantities(quantityG: number, costPerOz: number) {
  const quantityOz = quantityG / GRAMS_PER_OUNCE
  const quantityKg = quantityG / 1000
  const totalCost = quantityOz * costPerOz

  return { quantityG, quantityOz, quantityKg, totalCost }
}

export function applySaleToInventory(item: InventoryItem, quantityGrams: number) {
  const nextQuantityG = Math.max(0, item.quantityG - quantityGrams)
  return recalculateInventoryQuantities(nextQuantityG, item.costPerOz)
}
