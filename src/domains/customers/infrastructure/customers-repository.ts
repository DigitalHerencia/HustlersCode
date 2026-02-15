import type { Customer, Payment } from "@/lib/types"
import { dbQuery, toCamelCase, toSnakeCase } from "@/src/domains/shared/infrastructure/db"

export async function findCustomers(): Promise<Customer[]> {
  const customersResult = await dbQuery(`SELECT * FROM customers ORDER BY created_at DESC`)
  const customers = toCamelCase(customersResult.rows)

  for (const customer of customers) {
    const paymentsResult = await dbQuery(`SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC`, [customer.id])
    customer.payments = toCamelCase(paymentsResult.rows)
  }

  return customers
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  const customerResult = await dbQuery(`SELECT * FROM customers WHERE id = $1`, [id])
  if (customerResult.rows.length === 0) return null

  const customer = toCamelCase(customerResult.rows[0])
  const paymentsResult = await dbQuery(`SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC`, [id])
  customer.payments = toCamelCase(paymentsResult.rows)
  return customer
}

export async function createCustomerRecord(
  data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">,
): Promise<Customer> {
  const snakeCaseData = toSnakeCase(data)
  const result = await dbQuery(
    `INSERT INTO customers
     (name, phone, email, address, amount_owed, due_date, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      snakeCaseData.name,
      snakeCaseData.phone,
      snakeCaseData.email,
      snakeCaseData.address,
      snakeCaseData.amount_owed,
      snakeCaseData.due_date,
      snakeCaseData.status,
      snakeCaseData.notes,
    ],
  )

  const customer = toCamelCase(result.rows[0])
  customer.payments = []
  return customer
}

export async function updateCustomerRecord(id: string, data: Partial<Customer>) {
  const { payments, ...customerData } = data
  const snakeCaseData = toSnakeCase(customerData)
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

  await dbQuery(`UPDATE customers SET ${updates.join(", ")} WHERE id = $${paramIndex}`, values)
}

export async function deleteCustomerRecord(id: string) {
  await dbQuery(`DELETE FROM payments WHERE customer_id = $1`, [id])
  await dbQuery(`DELETE FROM customers WHERE id = $1`, [id])
}

export async function createPaymentRecord(
  customerId: string,
  data: Omit<Payment, "id" | "createdAt" | "customerId">,
): Promise<Payment> {
  const snakeCaseData = toSnakeCase(data)
  const paymentResult = await dbQuery(
    `INSERT INTO payments
     (customer_id, amount, date, method, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [customerId, snakeCaseData.amount, snakeCaseData.date, snakeCaseData.method, snakeCaseData.notes],
  )

  return toCamelCase(paymentResult.rows[0])
}

export async function findRawCustomerById(id: string): Promise<any | null> {
  const result = await dbQuery(`SELECT * FROM customers WHERE id = $1`, [id])
  return result.rows[0] ?? null
}

export async function updateCustomerLedger(id: string, amountOwed: number, status: string): Promise<void> {
  await dbQuery(
    `UPDATE customers
     SET amount_owed = $1, status = $2, updated_at = NOW()
     WHERE id = $3`,
    [amountOwed, status, id],
  )
}

export async function incrementCustomerAmountOwed(id: string, delta: number): Promise<void> {
  await dbQuery(
    `UPDATE customers
     SET amount_owed = amount_owed + $1, status = 'unpaid', updated_at = NOW()
     WHERE id = $2`,
    [delta, id],
  )
}
