"use server"

import { revalidatePath } from "next/cache"
import { query, toCamelCase, toSnakeCase } from "@/lib/db"
import type { BusinessData, ScenarioData, InventoryItem, Customer, Payment, Transaction, Account } from "@/lib/types"
import { z } from "zod"

const idSchema = z.string().trim().min(1)

const businessDataCreateSchema = z
  .object({
    wholesalePricePerOz: z.number().finite(),
    targetProfitPerMonth: z.number().finite(),
    operatingExpenses: z.number().finite(),
  })
  .strict()

const businessDataUpdateSchema = businessDataCreateSchema.partial().strict()

const salespersonInputSchema = z
  .object({
    name: z.string().trim().min(1),
    commissionRate: z.number().finite(),
    salesQuantity: z.number().finite(),
  })
  .strict()

const scenarioCreateSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().nullable(),
    wholesalePrice: z.number().finite(),
    retailPrice: z.number().finite(),
    quantity: z.number().finite(),
    timePeriod: z.string().trim().min(1),
    expenses: z.number().finite(),
    salespeople: z.array(salespersonInputSchema),
  })
  .strict()

const scenarioUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().nullable().optional(),
    wholesalePrice: z.number().finite().optional(),
    retailPrice: z.number().finite().optional(),
    quantity: z.number().finite().optional(),
    timePeriod: z.string().trim().min(1).optional(),
    expenses: z.number().finite().optional(),
    salespeople: z.array(salespersonInputSchema).optional(),
  })
  .strict()

const inventoryCreateSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().nullable(),
    quantityG: z.number().finite(),
    quantityOz: z.number().finite(),
    quantityKg: z.number().finite(),
    purchaseDate: z.string().trim().min(1),
    costPerOz: z.number().finite(),
    totalCost: z.number().finite(),
    reorderThresholdG: z.number().finite(),
  })
  .strict()

const inventoryUpdateSchema = inventoryCreateSchema.partial().strict()

const customerCreateSchema = z
  .object({
    name: z.string().trim().min(1),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    address: z.string().nullable(),
    amountOwed: z.number().finite(),
    dueDate: z.string().nullable(),
    status: z.string().trim().min(1),
    notes: z.string().nullable(),
  })
  .strict()

const customerUpdateSchema = customerCreateSchema.partial().strict()

const paymentCreateSchema = z
  .object({
    amount: z.number().finite(),
    date: z.string().trim().min(1),
    method: z.string().trim().min(1),
    notes: z.string().nullable(),
  })
  .strict()

const transactionCreateSchema = z
  .object({
    date: z.string().trim().min(1),
    type: z.string().trim().min(1),
    inventoryId: z.string().nullable(),
    inventoryName: z.string().nullable(),
    quantityGrams: z.number().finite(),
    pricePerGram: z.number().finite(),
    totalPrice: z.number().finite(),
    cost: z.number().finite(),
    profit: z.number().finite(),
    paymentMethod: z.string().trim().min(1),
    customerId: z.string().nullable(),
    customerName: z.string().nullable(),
    notes: z.string().nullable(),
  })
  .strict()

const accountCreateSchema = z
  .object({
    name: z.string().trim().min(1),
    type: z.string().trim().min(1),
    balance: z.number().finite(),
    description: z.string().nullable(),
  })
  .strict()

const accountUpdateSchema = accountCreateSchema.partial().strict()

// Business Data Actions
export async function getBusinessData(): Promise<BusinessData | null> {
  try {
    const result = await query(`SELECT * FROM business_data ORDER BY created_at DESC LIMIT 1`)

    if (result.rows.length === 0) {
      return null
    }

    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error fetching business data:", error)
    return null
  }
}

export async function saveBusinessData(
  data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">,
): Promise<BusinessData | null> {
  try {
    const parsedData = businessDataCreateSchema.parse(data)
    const snakeCaseData = toSnakeCase(parsedData)
    const result = await query(
      `INSERT INTO business_data 
       (wholesale_price_per_oz, target_profit_per_month, operating_expenses) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [snakeCaseData.wholesale_price_per_oz, snakeCaseData.target_profit_per_month, snakeCaseData.operating_expenses],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error saving business data:", error)
    return null
  }
}

export async function updateBusinessData(id: string, data: Partial<BusinessData>): Promise<BusinessData | null> {
  try {
    const parsedId = idSchema.parse(id)
    const parsedData = businessDataUpdateSchema.parse(data)
    const hasWholesalePricePerOz = Object.prototype.hasOwnProperty.call(parsedData, "wholesalePricePerOz")
    const hasTargetProfitPerMonth = Object.prototype.hasOwnProperty.call(parsedData, "targetProfitPerMonth")
    const hasOperatingExpenses = Object.prototype.hasOwnProperty.call(parsedData, "operatingExpenses")

    const result = await query(
      `UPDATE business_data
       SET wholesale_price_per_oz = CASE WHEN $1 THEN $2 ELSE wholesale_price_per_oz END,
           target_profit_per_month = CASE WHEN $3 THEN $4 ELSE target_profit_per_month END,
           operating_expenses = CASE WHEN $5 THEN $6 ELSE operating_expenses END,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        hasWholesalePricePerOz,
        parsedData.wholesalePricePerOz,
        hasTargetProfitPerMonth,
        parsedData.targetProfitPerMonth,
        hasOperatingExpenses,
        parsedData.operatingExpenses,
        parsedId,
      ],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error updating business data:", error)
    return null
  }
}

// Scenario Actions
export async function getScenarios(): Promise<ScenarioData[]> {
  try {
    const scenariosResult = await query(`SELECT * FROM scenarios ORDER BY created_at DESC`)

    const scenarios = toCamelCase(scenariosResult.rows)

    // For each scenario, fetch its salespeople
    for (const scenario of scenarios) {
      const salespeopleResult = await query(`SELECT * FROM salespeople WHERE scenario_id = $1`, [scenario.id])

      scenario.salespeople = toCamelCase(salespeopleResult.rows)
    }

    return scenarios
  } catch (error) {
    console.error("Error fetching scenarios:", error)
    return []
  }
}

export async function getScenario(id: string): Promise<ScenarioData | null> {
  try {
    const parsedId = idSchema.parse(id)
    const scenarioResult = await query(`SELECT * FROM scenarios WHERE id = $1`, [parsedId])

    if (scenarioResult.rows.length === 0) {
      return null
    }

    const scenario = toCamelCase(scenarioResult.rows[0])

    // Fetch salespeople for this scenario
    const salespeopleResult = await query(`SELECT * FROM salespeople WHERE scenario_id = $1`, [parsedId])

    scenario.salespeople = toCamelCase(salespeopleResult.rows)

    return scenario
  } catch (error) {
    console.error("Error fetching scenario:", error)
    return null
  }
}

export async function createScenario(
  data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">,
): Promise<ScenarioData | null> {
  try {
    const parsedData = scenarioCreateSchema.parse(data)
    const { salespeople, ...scenarioData } = parsedData
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
    const parsedId = idSchema.parse(id)
    const parsedData = scenarioUpdateSchema.parse(data)
    const { salespeople, ...scenarioData } = parsedData

    // Begin transaction
    await query("BEGIN")

    const hasName = Object.prototype.hasOwnProperty.call(scenarioData, "name")
    const hasDescription = Object.prototype.hasOwnProperty.call(scenarioData, "description")
    const hasWholesalePrice = Object.prototype.hasOwnProperty.call(scenarioData, "wholesalePrice")
    const hasRetailPrice = Object.prototype.hasOwnProperty.call(scenarioData, "retailPrice")
    const hasQuantity = Object.prototype.hasOwnProperty.call(scenarioData, "quantity")
    const hasTimePeriod = Object.prototype.hasOwnProperty.call(scenarioData, "timePeriod")
    const hasExpenses = Object.prototype.hasOwnProperty.call(scenarioData, "expenses")

    if (
      hasName ||
      hasDescription ||
      hasWholesalePrice ||
      hasRetailPrice ||
      hasQuantity ||
      hasTimePeriod ||
      hasExpenses
    ) {
      await query(
        `UPDATE scenarios
         SET name = CASE WHEN $1 THEN $2 ELSE name END,
             description = CASE WHEN $3 THEN $4 ELSE description END,
             wholesale_price = CASE WHEN $5 THEN $6 ELSE wholesale_price END,
             retail_price = CASE WHEN $7 THEN $8 ELSE retail_price END,
             quantity = CASE WHEN $9 THEN $10 ELSE quantity END,
             time_period = CASE WHEN $11 THEN $12 ELSE time_period END,
             expenses = CASE WHEN $13 THEN $14 ELSE expenses END,
             updated_at = NOW()
         WHERE id = $15`,
        [
          hasName,
          scenarioData.name,
          hasDescription,
          scenarioData.description,
          hasWholesalePrice,
          scenarioData.wholesalePrice,
          hasRetailPrice,
          scenarioData.retailPrice,
          hasQuantity,
          scenarioData.quantity,
          hasTimePeriod,
          scenarioData.timePeriod,
          hasExpenses,
          scenarioData.expenses,
          parsedId,
        ],
      )
    }

    // Update salespeople if provided
    if (salespeople) {
      // Delete existing salespeople
      await query(`DELETE FROM salespeople WHERE scenario_id = $1`, [parsedId])

      // Insert new salespeople
      for (const person of salespeople) {
        const snakeCasePerson = toSnakeCase(person)
        await query(
          `INSERT INTO salespeople
           (scenario_id, name, commission_rate, sales_quantity)
           VALUES ($1, $2, $3, $4)`,
          [parsedId, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
        )
      }
    }

    // Commit transaction
    await query("COMMIT")

    // Fetch the updated scenario with salespeople
    const result = await getScenario(parsedId)

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
    const parsedId = idSchema.parse(id)

    // Begin transaction
    await query("BEGIN")

    // Delete salespeople first (foreign key constraint)
    await query(`DELETE FROM salespeople WHERE scenario_id = $1`, [parsedId])

    // Delete scenario
    await query(`DELETE FROM scenarios WHERE id = $1`, [parsedId])

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
  try {
    const result = await query(`SELECT * FROM inventory_items ORDER BY created_at DESC`)

    return toCamelCase(result.rows)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return []
  }
}

export async function createInventoryItem(
  data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
): Promise<InventoryItem | null> {
  try {
    const parsedData = inventoryCreateSchema.parse(data)
    const snakeCaseData = toSnakeCase(parsedData)
    const result = await query(
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

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return null
  }
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
  try {
    const parsedId = idSchema.parse(id)
    const parsedData = inventoryUpdateSchema.parse(data)
    const hasName = Object.prototype.hasOwnProperty.call(parsedData, "name")
    const hasDescription = Object.prototype.hasOwnProperty.call(parsedData, "description")
    const hasQuantityG = Object.prototype.hasOwnProperty.call(parsedData, "quantityG")
    const hasQuantityOz = Object.prototype.hasOwnProperty.call(parsedData, "quantityOz")
    const hasQuantityKg = Object.prototype.hasOwnProperty.call(parsedData, "quantityKg")
    const hasPurchaseDate = Object.prototype.hasOwnProperty.call(parsedData, "purchaseDate")
    const hasCostPerOz = Object.prototype.hasOwnProperty.call(parsedData, "costPerOz")
    const hasTotalCost = Object.prototype.hasOwnProperty.call(parsedData, "totalCost")
    const hasReorderThresholdG = Object.prototype.hasOwnProperty.call(parsedData, "reorderThresholdG")

    const result = await query(
      `UPDATE inventory_items
       SET name = CASE WHEN $1 THEN $2 ELSE name END,
           description = CASE WHEN $3 THEN $4 ELSE description END,
           quantity_g = CASE WHEN $5 THEN $6 ELSE quantity_g END,
           quantity_oz = CASE WHEN $7 THEN $8 ELSE quantity_oz END,
           quantity_kg = CASE WHEN $9 THEN $10 ELSE quantity_kg END,
           purchase_date = CASE WHEN $11 THEN $12 ELSE purchase_date END,
           cost_per_oz = CASE WHEN $13 THEN $14 ELSE cost_per_oz END,
           total_cost = CASE WHEN $15 THEN $16 ELSE total_cost END,
           reorder_threshold_g = CASE WHEN $17 THEN $18 ELSE reorder_threshold_g END,
           updated_at = NOW()
       WHERE id = $19
       RETURNING *`,
      [
        hasName,
        parsedData.name,
        hasDescription,
        parsedData.description,
        hasQuantityG,
        parsedData.quantityG,
        hasQuantityOz,
        parsedData.quantityOz,
        hasQuantityKg,
        parsedData.quantityKg,
        hasPurchaseDate,
        parsedData.purchaseDate,
        hasCostPerOz,
        parsedData.costPerOz,
        hasTotalCost,
        parsedData.totalCost,
        hasReorderThresholdG,
        parsedData.reorderThresholdG,
        parsedId,
      ],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return null
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    const parsedId = idSchema.parse(id)
    await query(`DELETE FROM inventory_items WHERE id = $1`, [parsedId])

    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return false
  }
}

// Customer Actions
export async function getCustomers(): Promise<Customer[]> {
  try {
    const customersResult = await query(`SELECT * FROM customers ORDER BY created_at DESC`)

    const customers = toCamelCase(customersResult.rows)

    // For each customer, fetch their payments
    for (const customer of customers) {
      const paymentsResult = await query(`SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC`, [
        customer.id,
      ])

      customer.payments = toCamelCase(paymentsResult.rows)
    }

    return customers
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const parsedId = idSchema.parse(id)
    const customerResult = await query(`SELECT * FROM customers WHERE id = $1`, [parsedId])

    if (customerResult.rows.length === 0) {
      return null
    }

    const customer = toCamelCase(customerResult.rows[0])

    // Fetch payments for this customer
    const paymentsResult = await query(`SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC`, [parsedId])

    customer.payments = toCamelCase(paymentsResult.rows)

    return customer
  } catch (error) {
    console.error("Error fetching customer:", error)
    return null
  }
}

export async function createCustomer(
  data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">,
): Promise<Customer | null> {
  try {
    const parsedData = customerCreateSchema.parse(data)
    const snakeCaseData = toSnakeCase(parsedData)
    const result = await query(
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

    revalidatePath("/")
    return customer
  } catch (error) {
    console.error("Error creating customer:", error)
    return null
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
  try {
    const parsedId = idSchema.parse(id)
    const parsedData = customerUpdateSchema.parse(data)

    const hasName = Object.prototype.hasOwnProperty.call(parsedData, "name")
    const hasPhone = Object.prototype.hasOwnProperty.call(parsedData, "phone")
    const hasEmail = Object.prototype.hasOwnProperty.call(parsedData, "email")
    const hasAddress = Object.prototype.hasOwnProperty.call(parsedData, "address")
    const hasAmountOwed = Object.prototype.hasOwnProperty.call(parsedData, "amountOwed")
    const hasDueDate = Object.prototype.hasOwnProperty.call(parsedData, "dueDate")
    const hasStatus = Object.prototype.hasOwnProperty.call(parsedData, "status")
    const hasNotes = Object.prototype.hasOwnProperty.call(parsedData, "notes")

    await query(
      `UPDATE customers
       SET name = CASE WHEN $1 THEN $2 ELSE name END,
           phone = CASE WHEN $3 THEN $4 ELSE phone END,
           email = CASE WHEN $5 THEN $6 ELSE email END,
           address = CASE WHEN $7 THEN $8 ELSE address END,
           amount_owed = CASE WHEN $9 THEN $10 ELSE amount_owed END,
           due_date = CASE WHEN $11 THEN $12 ELSE due_date END,
           status = CASE WHEN $13 THEN $14 ELSE status END,
           notes = CASE WHEN $15 THEN $16 ELSE notes END,
           updated_at = NOW()
       WHERE id = $17`,
      [
        hasName,
        parsedData.name,
        hasPhone,
        parsedData.phone,
        hasEmail,
        parsedData.email,
        hasAddress,
        parsedData.address,
        hasAmountOwed,
        parsedData.amountOwed,
        hasDueDate,
        parsedData.dueDate,
        hasStatus,
        parsedData.status,
        hasNotes,
        parsedData.notes,
        parsedId,
      ],
    )

    // Fetch the updated customer with payments
    const result = await getCustomer(parsedId)

    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error updating customer:", error)
    return null
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    // Begin transaction
    await query("BEGIN")

    // Delete payments first (foreign key constraint)
    const parsedId = idSchema.parse(id)
    await query(`DELETE FROM payments WHERE customer_id = $1`, [parsedId])

    // Delete customer
    await query(`DELETE FROM customers WHERE id = $1`, [parsedId])

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
    const parsedCustomerId = idSchema.parse(customerId)
    const parsedData = paymentCreateSchema.parse(data)
    const snakeCaseData = toSnakeCase(parsedData)

    // Begin transaction
    await query("BEGIN")

    // Insert payment
    const paymentResult = await query(
      `INSERT INTO payments 
       (customer_id, amount, date, method, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [parsedCustomerId, snakeCaseData.amount, snakeCaseData.date, snakeCaseData.method, snakeCaseData.notes],
    )

    // Get the customer
    const customerResult = await query(`SELECT * FROM customers WHERE id = $1`, [parsedCustomerId])

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
        [newAmountOwed, newStatus, parsedCustomerId],
      )
    }

    // Commit transaction
    await query("COMMIT")

    revalidatePath("/")
    return toCamelCase(paymentResult.rows[0])
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error adding payment:", error)
    return null
  }
}

// Transaction Actions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const result = await query(`SELECT * FROM transactions ORDER BY created_at DESC`)

    return toCamelCase(result.rows)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction | null> {
  try {
    const parsedData = transactionCreateSchema.parse(data)
    const snakeCaseData = toSnakeCase(parsedData)

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
    return toCamelCase(transactionResult.rows[0])
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error creating transaction:", error)
    return null
  }
}

// Account Actions
export async function getAccounts(): Promise<Account[]> {
  try {
    const result = await query(`SELECT * FROM accounts ORDER BY created_at DESC`)

    return toCamelCase(result.rows)
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account | null> {
  try {
    const parsedData = accountCreateSchema.parse(data)
    const snakeCaseData = toSnakeCase(parsedData)
    const result = await query(
      `INSERT INTO accounts 
       (name, type, balance, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [snakeCaseData.name, snakeCaseData.type, snakeCaseData.balance, snakeCaseData.description],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error creating account:", error)
    return null
  }
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account | null> {
  try {
    const parsedId = idSchema.parse(id)
    const parsedData = accountUpdateSchema.parse(data)

    const hasName = Object.prototype.hasOwnProperty.call(parsedData, "name")
    const hasType = Object.prototype.hasOwnProperty.call(parsedData, "type")
    const hasBalance = Object.prototype.hasOwnProperty.call(parsedData, "balance")
    const hasDescription = Object.prototype.hasOwnProperty.call(parsedData, "description")

    const result = await query(
      `UPDATE accounts
       SET name = CASE WHEN $1 THEN $2 ELSE name END,
           type = CASE WHEN $3 THEN $4 ELSE type END,
           balance = CASE WHEN $5 THEN $6 ELSE balance END,
           description = CASE WHEN $7 THEN $8 ELSE description END,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [hasName, parsedData.name, hasType, parsedData.type, hasBalance, parsedData.balance, hasDescription, parsedData.description, parsedId],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error updating account:", error)
    return null
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    const parsedId = idSchema.parse(id)
    await query(`DELETE FROM accounts WHERE id = $1`, [parsedId])

    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting account:", error)
    return false
  }
}

// Initialize default business data if none exists
export async function initializeDefaultBusinessData(): Promise<BusinessData | null> {
  try {
    const existingDataResult = await query(`SELECT * FROM business_data LIMIT 1`)

    if (existingDataResult.rows.length === 0) {
      const result = await query(
        `INSERT INTO business_data 
         (wholesale_price_per_oz, target_profit_per_month, operating_expenses) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [100, 2000, 500],
      )

      return toCamelCase(result.rows[0])
    }

    return toCamelCase(existingDataResult.rows[0])
  } catch (error) {
    console.error("Error initializing default business data:", error)
    return null
  }
}
