"use server"

import "server-only"


import { revalidatePath } from "next/cache"
import { query, toCamelCase, toSnakeCase } from "@/lib/db"
import type { BusinessData, ScenarioData, InventoryItem, Customer, Payment, Transaction, Account } from "@/lib/types"
import { auth } from "@clerk/nextjs/server"


async function requireAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return userId
}

const isPrismaNotFound = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"

const isPrismaNotFound = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"

// Business Data Actions
export async function getBusinessData(): Promise<BusinessData | null> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.businessData.getLatest()
  } catch (error) {
    console.error("Error fetching business data:", error)
    return null
  }
}

export async function saveBusinessData(
  data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">,
): Promise<BusinessData | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.businessData.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error saving business data:", error)
    return null
  }
}

export async function updateBusinessData(id: string, data: Partial<BusinessData>): Promise<BusinessData | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.businessData.update(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error updating business data:", error)
    return null
  }
}

// Scenario Actions
export async function getScenarios(): Promise<ScenarioData[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.scenarios.list()
  } catch (error) {
    console.error("Error fetching scenarios:", error)
    return []
  }
}

export async function getScenario(id: string): Promise<ScenarioData | null> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.scenarios.getById(id)
  } catch (error) {
    console.error("Error fetching scenario:", error)
    return null
  }
}

export async function createScenario(
  data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">,
): Promise<ScenarioData | null> {
  try {
    const { salespeople, ...scenarioData } = data
    const snakeCaseData = toSnakeCase(scenarioData)

    // Begin transaction
    await query("BEGIN")

    // Insert scenario
    const scenarioResult = await query(
      `INSERT INTO scenarios 
       (name, description, wholesale_price, retail_price, quantity, time_period, expenses)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        snakeCaseData.name,
        snakeCaseData.description,
        snakeCaseData.wholesale_price,
        snakeCaseData.retail_price,
        snakeCaseData.quantity,
        snakeCaseData.time_period,
        snakeCaseData.expenses,
      ],
    )

    const scenario = toCamelCase(scenarioResult.rows[0])

    // Insert salespeople if provided
    if (salespeople && salespeople.length > 0) {
      for (const person of salespeople) {
        const snakeCasePerson = toSnakeCase(person)
        await query(
          `INSERT INTO salespeople
           (scenario_id, name, commission_rate, sales_quantity)
           VALUES ($1, $2, $3, $4)`,
          [scenario.id, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
        )
      }
    }

    // Commit transaction
    await query("COMMIT")

    // Fetch the complete scenario with salespeople
    const result = await getScenario(scenario.id)

    revalidatePath("/")
    return result
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error creating scenario:", error)
    return null
  }
}


export async function updateScenario(id: string, data: Partial<ScenarioData>): Promise<ScenarioData | null> {
  try {
    const { salespeople, ...scenarioData } = data
    const snakeCaseData = toSnakeCase(scenarioData)

    // Begin transaction
    await query("BEGIN")

    // Build dynamic query for scenario update
    if (Object.keys(snakeCaseData).length > 0) {
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      for (const [key, value] of Object.entries(snakeCaseData)) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }

      // Add updated_at timestamp
      updates.push(`updated_at = NOW()`)

      // Add id as the last parameter
      values.push(id)

      await query(
        `UPDATE scenarios 
         SET ${updates.join(", ")} 
         WHERE id = $${paramIndex}`,
        values,
      )
    }

    // Update salespeople if provided
    if (salespeople) {
      // Delete existing salespeople
      await query(`DELETE FROM salespeople WHERE scenario_id = $1`, [id])

      // Insert new salespeople
      for (const person of salespeople) {
        const snakeCasePerson = toSnakeCase(person)
        await query(
          `INSERT INTO salespeople
           (scenario_id, name, commission_rate, sales_quantity)
           VALUES ($1, $2, $3, $4)`,
          [id, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
        )
      }
    }

    // Commit transaction
    await query("COMMIT")

    // Fetch the updated scenario with salespeople
    const result = await getScenario(id)

    revalidatePath("/")
    return result
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error updating scenario:", error)
    return null
  }
}


export async function deleteScenario(id: string): Promise<boolean> {
  try {
    // Begin transaction
    await query("BEGIN")

    // Delete salespeople first (foreign key constraint)
    await query(`DELETE FROM salespeople WHERE scenario_id = $1`, [id])

    // Delete scenario
    await query(`DELETE FROM scenarios WHERE id = $1`, [id])

    // Commit transaction
    await query("COMMIT")

    revalidatePath("/")
    return true
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error deleting scenario:", error)
    return false
  }
}


// Inventory Actions
export async function getInventory(): Promise<InventoryItem[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.inventory.list()
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return []
  }
}

export async function createInventoryItem(
  data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
): Promise<InventoryItem | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.inventory.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return null
  }
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.inventory.update(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return null
    }
    console.error("Error updating inventory item:", error)
    return null
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  await requireAuthenticatedUserId()
  try {
    await repositories.inventory.delete(id)
    revalidatePath("/")
    return true
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return false
    }
    console.error("Error deleting inventory item:", error)
    return false
  }
}

// Customer Actions
export async function getCustomers(): Promise<Customer[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.customers.list()
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.customers.getById(id)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return null
  }
}

export async function createCustomer(
  data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">,
): Promise<Customer | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.customers.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating customer:", error)
    return null
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.customers.update(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return null
    }
    console.error("Error updating customer:", error)
    return null
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    // Begin transaction
    await query("BEGIN")

    // Delete payments first (foreign key constraint)
    await query(`DELETE FROM payments WHERE customer_id = $1`, [id])

    // Delete customer
    await query(`DELETE FROM customers WHERE id = $1`, [id])

    // Commit transaction
    await query("COMMIT")

    revalidatePath("/")
    return true
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error deleting customer:", error)
    return false
  }
}


// Payment Actions
export async function addPayment(
  customerId: string,
  data: Omit<Payment, "id" | "createdAt" | "customerId">,
): Promise<Payment | null> {
  try {
    const snakeCaseData = toSnakeCase(data)

    // Begin transaction
    await query("BEGIN")

    // Insert payment
    const paymentResult = await query(
      `INSERT INTO payments 
       (customer_id, amount, date, method, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [customerId, snakeCaseData.amount, snakeCaseData.date, snakeCaseData.method, snakeCaseData.notes],
    )

    // Get the customer
    const customerResult = await query(`SELECT * FROM customers WHERE id = $1`, [customerId])

    if (customerResult.rows.length > 0) {
      const customer = customerResult.rows[0]

      // Calculate new amount owed
      const newAmountOwed = Math.max(0, customer.amount_owed - snakeCaseData.amount)

      // Determine new status
      let newStatus = "unpaid"
      if (newAmountOwed === 0) {
        newStatus = "paid"
      } else if (snakeCaseData.amount > 0) {
        newStatus = "partial"
      }

      // Update customer
      await query(
        `UPDATE customers 
         SET amount_owed = $1, status = $2, updated_at = NOW() 
         WHERE id = $3`,
        [newAmountOwed, newStatus, customerId],
      )
    }

    // Commit transaction
    await query("COMMIT")

    revalidatePath("/")
    return result
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error adding payment:", error)
    return null
  }
}


// Transaction Actions
export async function getTransactions(): Promise<Transaction[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.transactions.list()
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction | null> {
  try {
    const snakeCaseData = toSnakeCase(data)

    // Begin transaction
    await query("BEGIN")

    // Insert transaction
    const transactionResult = await query(
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

    // If it's a sale, update inventory
    if (snakeCaseData.type === "sale" && snakeCaseData.inventory_id) {
      const inventoryResult = await query(`SELECT * FROM inventory_items WHERE id = $1`, [snakeCaseData.inventory_id])

      if (inventoryResult.rows.length > 0) {
        const inventory = inventoryResult.rows[0]

        // Calculate new quantity
        const newQuantityG = Math.max(0, inventory.quantity_g - snakeCaseData.quantity_grams)
        const newQuantityOz = newQuantityG / 28.3495
        const newQuantityKg = newQuantityG / 1000
        const newTotalCost = newQuantityOz * inventory.cost_per_oz

        // Update inventory
        await query(
          `UPDATE inventory_items 
           SET quantity_g = $1, quantity_oz = $2, quantity_kg = $3, total_cost = $4, updated_at = NOW() 
           WHERE id = $5`,
          [newQuantityG, newQuantityOz, newQuantityKg, newTotalCost, snakeCaseData.inventory_id],
        )
      }
    }

    // If it's a credit sale, update customer
    if (snakeCaseData.type === "sale" && snakeCaseData.customer_id && snakeCaseData.payment_method === "credit") {
      const customerResult = await query(`SELECT * FROM customers WHERE id = $1`, [snakeCaseData.customer_id])

      if (customerResult.rows.length > 0) {
        const customer = customerResult.rows[0]

        await query(
          `UPDATE customers 
           SET amount_owed = $1, status = 'unpaid', updated_at = NOW() 
           WHERE id = $2`,
          [customer.amount_owed + snakeCaseData.total_price, snakeCaseData.customer_id],
        )
      }
    }

    // Commit transaction
    await query("COMMIT")

    revalidatePath("/")
    return result
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error creating transaction:", error)
    return null
  }
}


// Account Actions
export async function getAccounts(): Promise<Account[]> {
  await requireAuthenticatedUserId()
  try {
    return await repositories.accounts.list()
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.accounts.create(data)
    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error creating account:", error)
    return null
  }
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account | null> {
  await requireAuthenticatedUserId()
  try {
    const result = await repositories.accounts.update(id, data)
    revalidatePath("/")
    return result
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return null
    }
    console.error("Error updating account:", error)
    return null
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  await requireAuthenticatedUserId()
  try {
    await repositories.accounts.delete(id)
    revalidatePath("/")
    return true
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return false
    }
    console.error("Error deleting account:", error)
    return false
  }
}

export async function initializeDefaultBusinessData(): Promise<BusinessData | null> {
  await requireAuthenticatedUserId()
  try {
    const existing = await repositories.businessData.getLatest()
    if (existing) {
      return existing
    }
    return await repositories.businessData.create({
      wholesalePricePerOz: 100,
      targetProfitPerMonth: 2000,
      operatingExpenses: 500,
    })
  } catch (error) {
    console.error("Error initializing default business data:", error)
    return null
  }
}
