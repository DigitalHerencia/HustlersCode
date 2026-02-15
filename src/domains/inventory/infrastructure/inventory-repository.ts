import type { InventoryItem } from "@/lib/types"
import { dbQuery, toCamelCase, toSnakeCase } from "@/src/domains/shared/infrastructure/db"

export async function findAllInventoryItems(): Promise<InventoryItem[]> {
  const result = await dbQuery(`SELECT * FROM inventory_items ORDER BY created_at DESC`)
  return toCamelCase(result.rows)
}

export async function findInventoryItemById(id: string): Promise<InventoryItem | null> {
  const result = await dbQuery(`SELECT * FROM inventory_items WHERE id = $1`, [id])
  if (result.rows.length === 0) return null
  return toCamelCase(result.rows[0])
}

export async function insertInventoryItem(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): Promise<InventoryItem> {
  const snakeCaseData = toSnakeCase(data)
  const result = await dbQuery(
    `INSERT INTO inventory_items
     (name, description, quantity_g, quantity_oz, quantity_kg, purchase_date, cost_per_oz, total_cost, reorder_threshold_g)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      snakeCaseData.name,
      snakeCaseData.description,
      snakeCaseData.quantity_g,
      snakeCaseData.quantity_oz,
      snakeCaseData.quantity_kg,
      snakeCaseData.purchase_date,
      snakeCaseData.cost_per_oz,
      snakeCaseData.total_cost,
      snakeCaseData.reorder_threshold_g,
    ],
  )
  return toCamelCase(result.rows[0])
}

export async function patchInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
  const snakeCaseData = toSnakeCase(data)
  const updates: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  for (const [key, value] of Object.entries(snakeCaseData)) {
    if (value !== undefined) {
      updates.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  }

  updates.push(`updated_at = NOW()`)
  values.push(id)

  const result = await dbQuery(
    `UPDATE inventory_items
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values,
  )

  if (result.rows.length === 0) return null
  return toCamelCase(result.rows[0])
}

export async function removeInventoryItem(id: string): Promise<void> {
  await dbQuery(`DELETE FROM inventory_items WHERE id = $1`, [id])
}
