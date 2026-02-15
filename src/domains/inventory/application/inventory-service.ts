import type { InventoryItem } from "@/lib/types"
import { applySaleToInventory } from "@/src/domains/inventory/domain/inventory-rules"
import {
  findAllInventoryItems,
  findInventoryItemById,
  insertInventoryItem,
  patchInventoryItem,
  removeInventoryItem,
} from "@/src/domains/inventory/infrastructure/inventory-repository"

export async function listInventoryItems() {
  return findAllInventoryItems()
}

export async function createInventory(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) {
  return insertInventoryItem(data)
}

export async function updateInventory(id: string, data: Partial<InventoryItem>) {
  return patchInventoryItem(id, data)
}

export async function deleteInventory(id: string) {
  await removeInventoryItem(id)
}

export async function decrementInventoryForSale(inventoryId: string, quantityGrams: number) {
  const existing = await findInventoryItemById(inventoryId)
  if (!existing) return

  const nextValues = applySaleToInventory(existing, quantityGrams)
  await patchInventoryItem(inventoryId, nextValues)
}
