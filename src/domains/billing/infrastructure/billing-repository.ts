import type { Account, Transaction } from "@/lib/types"
import { dbQuery, toCamelCase, toSnakeCase } from "@/src/domains/shared/infrastructure/db"

export async function findTransactions(): Promise<Transaction[]> {
  const result = await dbQuery(`SELECT * FROM transactions ORDER BY created_at DESC`)
  return toCamelCase(result.rows)
}

export async function createTransactionRecord(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
  const snakeCaseData = toSnakeCase(data)
  const transactionResult = await dbQuery(
    `INSERT INTO transactions
     (date, type, inventory_id, inventory_name, quantity_grams, price_per_gram, total_price,
      cost, profit, payment_method, customer_id, customer_name, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      snakeCaseData.date,
      snakeCaseData.type,
      snakeCaseData.inventory_id,
      snakeCaseData.inventory_name,
      snakeCaseData.quantity_grams,
      snakeCaseData.price_per_gram,
      snakeCaseData.total_price,
      snakeCaseData.cost,
      snakeCaseData.profit,
      snakeCaseData.payment_method,
      snakeCaseData.customer_id,
      snakeCaseData.customer_name,
      snakeCaseData.notes,
    ],
  )

  return toCamelCase(transactionResult.rows[0])
}

export async function findAccounts(): Promise<Account[]> {
  const result = await dbQuery(`SELECT * FROM accounts ORDER BY created_at DESC`)
  return toCamelCase(result.rows)
}

export async function createAccountRecord(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account> {
  const snakeCaseData = toSnakeCase(data)
  const result = await dbQuery(
    `INSERT INTO accounts
     (name, type, balance, description)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [snakeCaseData.name, snakeCaseData.type, snakeCaseData.balance, snakeCaseData.description],
  )

  return toCamelCase(result.rows[0])
}

export async function updateAccountRecord(id: string, data: Partial<Account>): Promise<Account | null> {
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
    `UPDATE accounts
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values,
  )

  if (result.rows.length === 0) return null
  return toCamelCase(result.rows[0])
}

export async function deleteAccountRecord(id: string): Promise<void> {
  await dbQuery(`DELETE FROM accounts WHERE id = $1`, [id])
}
