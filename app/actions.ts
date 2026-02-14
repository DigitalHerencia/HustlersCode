"use server"

import { revalidatePath } from "next/cache"
import { query, toCamelCase, toSnakeCase } from "@/lib/db"
import { requireAuthorization } from "@/lib/authz/guard"
import type { BusinessData, ScenarioData, InventoryItem, Customer, Payment, Transaction, Account } from "@/lib/types"

async function getTenantIdFor(action: Parameters<typeof requireAuthorization>[0]): Promise<string> {
  const principal = await requireAuthorization(action)
  return principal.tenantId
}

// Business Data Actions
export async function getBusinessData(): Promise<BusinessData | null> {
  try {
    const tenantId = await getTenantIdFor("sensitive:read")
    const result = await query(`SELECT * FROM business_data WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1`, [tenantId])

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
    const tenantId = await getTenantIdFor("business_data:write")
    const snakeCaseData = toSnakeCase(data)
    const result = await query(
      `INSERT INTO business_data 
       (tenant_id, wholesale_price_per_oz, target_profit_per_month, operating_expenses) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [tenantId, snakeCaseData.wholesale_price_per_oz, snakeCaseData.target_profit_per_month, snakeCaseData.operating_expenses],
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
    const tenantId = await getTenantIdFor("business_data:write")
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    const snakeCaseData = toSnakeCase(data)

    if (snakeCaseData.wholesale_price_per_oz !== undefined) {
      updates.push(`wholesale_price_per_oz = $${paramIndex}`)
      values.push(snakeCaseData.wholesale_price_per_oz)
      paramIndex++
    }

    if (snakeCaseData.target_profit_per_month !== undefined) {
      updates.push(`target_profit_per_month = $${paramIndex}`)
      values.push(snakeCaseData.target_profit_per_month)
      paramIndex++
    }

    if (snakeCaseData.operating_expenses !== undefined) {
      updates.push(`operating_expenses = $${paramIndex}`)
      values.push(snakeCaseData.operating_expenses)
      paramIndex++
    }

    updates.push(`updated_at = NOW()`)
    values.push(id, tenantId)

    const result = await query(
      `UPDATE business_data 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
       RETURNING *`,
      values,
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error updating business data:", error)
    return null
  }
}

export async function getScenarios(): Promise<ScenarioData[]> {
  try {
    const tenantId = await getTenantIdFor("sensitive:read")
    const scenariosResult = await query(`SELECT * FROM scenarios WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId])
    const scenarios = toCamelCase(scenariosResult.rows)

    for (const scenario of scenarios) {
      const salespeopleResult = await query(`SELECT * FROM salespeople WHERE scenario_id = $1 AND tenant_id = $2`, [scenario.id, tenantId])
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
    const tenantId = await getTenantIdFor("sensitive:read")
    const scenarioResult = await query(`SELECT * FROM scenarios WHERE id = $1 AND tenant_id = $2`, [id, tenantId])

    if (scenarioResult.rows.length === 0) {
      return null
    }

    const scenario = toCamelCase(scenarioResult.rows[0])
    const salespeopleResult = await query(`SELECT * FROM salespeople WHERE scenario_id = $1 AND tenant_id = $2`, [id, tenantId])
    scenario.salespeople = toCamelCase(salespeopleResult.rows)

    return scenario
  } catch (error) {
    console.error("Error fetching scenario:", error)
    return null
  }
}

export async function createScenario(data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">): Promise<ScenarioData | null> {
  try {
    const tenantId = await getTenantIdFor("scenario:create")
    const { salespeople, ...scenarioData } = data
    const snakeCaseData = toSnakeCase(scenarioData)

    await query("BEGIN")
    const scenarioResult = await query(
      `INSERT INTO scenarios 
       (tenant_id, name, description, wholesale_price, retail_price, quantity, time_period, expenses)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tenantId, snakeCaseData.name, snakeCaseData.description, snakeCaseData.wholesale_price, snakeCaseData.retail_price, snakeCaseData.quantity, snakeCaseData.time_period, snakeCaseData.expenses],
    )

    const scenario = toCamelCase(scenarioResult.rows[0])

    if (salespeople && salespeople.length > 0) {
      for (const person of salespeople) {
        const snakeCasePerson = toSnakeCase(person)
        await query(
          `INSERT INTO salespeople (scenario_id, tenant_id, name, commission_rate, sales_quantity)
           VALUES ($1, $2, $3, $4, $5)`,
          [scenario.id, tenantId, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
        )
      }
    }

    await query("COMMIT")
    const result = await getScenario(scenario.id)
    revalidatePath("/")
    return result
  } catch (error) {
    await query("ROLLBACK")
    console.error("Error creating scenario:", error)
    return null
  }
}

export async function updateScenario(id: string, data: Partial<ScenarioData>): Promise<ScenarioData | null> {
  try {
    const tenantId = await getTenantIdFor("scenario:update")
    const { salespeople, ...scenarioData } = data
    const snakeCaseData = toSnakeCase(scenarioData)

    await query("BEGIN")

    if (Object.keys(snakeCaseData).length > 0) {
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      for (const [key, value] of Object.entries(snakeCaseData)) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }

      updates.push(`updated_at = NOW()`)
      values.push(id, tenantId)

      await query(`UPDATE scenarios SET ${updates.join(", ")} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}`, values)
    }

    if (salespeople) {
      await query(`DELETE FROM salespeople WHERE scenario_id = $1 AND tenant_id = $2`, [id, tenantId])

      for (const person of salespeople) {
        const snakeCasePerson = toSnakeCase(person)
        await query(
          `INSERT INTO salespeople (scenario_id, tenant_id, name, commission_rate, sales_quantity)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, tenantId, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
        )
      }
    }

    await query("COMMIT")
    const result = await getScenario(id)
    revalidatePath("/")
    return result
  } catch (error) {
    await query("ROLLBACK")
    console.error("Error updating scenario:", error)
    return null
  }
}

export async function deleteScenario(id: string): Promise<boolean> {
  try {
    const tenantId = await getTenantIdFor("scenario:delete")
    await query("BEGIN")
    await query(`DELETE FROM salespeople WHERE scenario_id = $1 AND tenant_id = $2`, [id, tenantId])
    await query(`DELETE FROM scenarios WHERE id = $1 AND tenant_id = $2`, [id, tenantId])
    await query("COMMIT")

    revalidatePath("/")
    return true
  } catch (error) {
    await query("ROLLBACK")
    console.error("Error deleting scenario:", error)
    return false
  }
}

export async function getInventory(): Promise<InventoryItem[]> {
  try {
    const tenantId = await getTenantIdFor("sensitive:read")
    const result = await query(`SELECT * FROM inventory_items WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId])
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
    const tenantId = await getTenantIdFor("inventory:create")
    const snakeCaseData = toSnakeCase(data)
    const result = await query(
      `INSERT INTO inventory_items 
       (tenant_id, name, description, quantity_g, quantity_oz, quantity_kg, purchase_date, cost_per_oz, total_cost, reorder_threshold_g)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [tenantId, snakeCaseData.name, snakeCaseData.description, snakeCaseData.quantity_g, snakeCaseData.quantity_oz, snakeCaseData.quantity_kg, snakeCaseData.purchase_date, snakeCaseData.cost_per_oz, snakeCaseData.total_cost, snakeCaseData.reorder_threshold_g],
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
    const tenantId = await getTenantIdFor("inventory:update")
    const snakeCaseData = toSnakeCase(data)
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(snakeCaseData)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    updates.push(`updated_at = NOW()`)
    values.push(id, tenantId)

    const result = await query(
      `UPDATE inventory_items SET ${updates.join(", ")} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1} RETURNING *`,
      values,
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
    const tenantId = await getTenantIdFor("inventory:delete")
    await query(`DELETE FROM inventory_items WHERE id = $1 AND tenant_id = $2`, [id, tenantId])

    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return false
  }
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const tenantId = await getTenantIdFor("sensitive:read")
    const customersResult = await query(`SELECT * FROM customers WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId])
    const customers = toCamelCase(customersResult.rows)

    for (const customer of customers) {
      const paymentsResult = await query(`SELECT * FROM payments WHERE customer_id = $1 AND tenant_id = $2 ORDER BY date DESC`, [customer.id, tenantId])
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
    const tenantId = await getTenantIdFor("sensitive:read")
    const customerResult = await query(`SELECT * FROM customers WHERE id = $1 AND tenant_id = $2`, [id, tenantId])

    if (customerResult.rows.length === 0) {
      return null
    }

    const customer = toCamelCase(customerResult.rows[0])
    const paymentsResult = await query(`SELECT * FROM payments WHERE customer_id = $1 AND tenant_id = $2 ORDER BY date DESC`, [id, tenantId])
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
    const tenantId = await getTenantIdFor("customer:create")
    const snakeCaseData = toSnakeCase(data)
    const result = await query(
      `INSERT INTO customers 
       (tenant_id, name, phone, email, address, amount_owed, due_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [tenantId, snakeCaseData.name, snakeCaseData.phone, snakeCaseData.email, snakeCaseData.address, snakeCaseData.amount_owed, snakeCaseData.due_date, snakeCaseData.status, snakeCaseData.notes],
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
    const tenantId = await getTenantIdFor("customer:update")
    const { payments, ...customerData } = data
    const snakeCaseData = toSnakeCase(customerData)

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(snakeCaseData)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    updates.push(`updated_at = NOW()`)
    values.push(id, tenantId)

    await query(`UPDATE customers SET ${updates.join(", ")} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}`, values)

    const result = await getCustomer(id)

    revalidatePath("/")
    return result
  } catch (error) {
    console.error("Error updating customer:", error)
    return null
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const tenantId = await getTenantIdFor("customer:delete")
    await query("BEGIN")
    await query(`DELETE FROM payments WHERE customer_id = $1 AND tenant_id = $2`, [id, tenantId])
    await query(`DELETE FROM customers WHERE id = $1 AND tenant_id = $2`, [id, tenantId])
    await query("COMMIT")

    revalidatePath("/")
    return true
  } catch (error) {
    await query("ROLLBACK")
    console.error("Error deleting customer:", error)
    return false
  }
}

export async function addPayment(
  customerId: string,
  data: Omit<Payment, "id" | "createdAt" | "customerId">,
): Promise<Payment | null> {
  try {
    const tenantId = await getTenantIdFor("payment:create")
    const snakeCaseData = toSnakeCase(data)

    await query("BEGIN")

    const paymentResult = await query(
      `INSERT INTO payments 
       (customer_id, tenant_id, amount, date, method, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [customerId, tenantId, snakeCaseData.amount, snakeCaseData.date, snakeCaseData.method, snakeCaseData.notes],
    )

    const customerResult = await query(`SELECT * FROM customers WHERE id = $1 AND tenant_id = $2`, [customerId, tenantId])

    if (customerResult.rows.length > 0) {
      const customer = customerResult.rows[0]
      const newAmountOwed = Math.max(0, customer.amount_owed - snakeCaseData.amount)

      let newStatus = "unpaid"
      if (newAmountOwed === 0) {
        newStatus = "paid"
      } else if (snakeCaseData.amount > 0) {
        newStatus = "partial"
      }

      await query(`UPDATE customers SET amount_owed = $1, status = $2, updated_at = NOW() WHERE id = $3 AND tenant_id = $4`, [newAmountOwed, newStatus, customerId, tenantId])
    }

    await query("COMMIT")

    revalidatePath("/")
    return toCamelCase(paymentResult.rows[0])
  } catch (error) {
    await query("ROLLBACK")
    console.error("Error adding payment:", error)
    return null
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const tenantId = await getTenantIdFor("sensitive:read")
    const result = await query(`SELECT * FROM transactions WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId])
    return toCamelCase(result.rows)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction | null> {
  try {
    const tenantId = await getTenantIdFor("transaction:create")
    const snakeCaseData = toSnakeCase(data)

    await query("BEGIN")

    const transactionResult = await query(
      `INSERT INTO transactions 
       (tenant_id, date, type, inventory_id, inventory_name, quantity_grams, price_per_gram, total_price, 
        cost, profit, payment_method, customer_id, customer_name, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [tenantId, snakeCaseData.date, snakeCaseData.type, snakeCaseData.inventory_id, snakeCaseData.inventory_name, snakeCaseData.quantity_grams, snakeCaseData.price_per_gram, snakeCaseData.total_price, snakeCaseData.cost, snakeCaseData.profit, snakeCaseData.payment_method, snakeCaseData.customer_id, snakeCaseData.customer_name, snakeCaseData.notes],
    )

    if (snakeCaseData.type === "sale" && snakeCaseData.inventory_id) {
      const inventoryResult = await query(`SELECT * FROM inventory_items WHERE id = $1 AND tenant_id = $2`, [snakeCaseData.inventory_id, tenantId])

      if (inventoryResult.rows.length > 0) {
        const inventory = inventoryResult.rows[0]
        const newQuantityG = Math.max(0, inventory.quantity_g - snakeCaseData.quantity_grams)
        const newQuantityOz = newQuantityG / 28.3495
        const newQuantityKg = newQuantityG / 1000
        const newTotalCost = newQuantityOz * inventory.cost_per_oz

        await query(
          `UPDATE inventory_items SET quantity_g = $1, quantity_oz = $2, quantity_kg = $3, total_cost = $4, updated_at = NOW() WHERE id = $5 AND tenant_id = $6`,
          [newQuantityG, newQuantityOz, newQuantityKg, newTotalCost, snakeCaseData.inventory_id, tenantId],
        )
      }
    }

    if (snakeCaseData.type === "sale" && snakeCaseData.customer_id && snakeCaseData.payment_method === "credit") {
      const customerResult = await query(`SELECT * FROM customers WHERE id = $1 AND tenant_id = $2`, [snakeCaseData.customer_id, tenantId])

      if (customerResult.rows.length > 0) {
        const customer = customerResult.rows[0]
        await query(`UPDATE customers SET amount_owed = $1, status = 'unpaid', updated_at = NOW() WHERE id = $2 AND tenant_id = $3`, [customer.amount_owed + snakeCaseData.total_price, snakeCaseData.customer_id, tenantId])
      }
    }

    await query("COMMIT")

    revalidatePath("/")
    return toCamelCase(transactionResult.rows[0])
  } catch (error) {
    await query("ROLLBACK")
    console.error("Error creating transaction:", error)
    return null
  }
}

export async function getAccounts(): Promise<Account[]> {
  try {
    const tenantId = await getTenantIdFor("sensitive:read")
    const result = await query(`SELECT * FROM accounts WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId])
    return toCamelCase(result.rows)
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account | null> {
  try {
    const tenantId = await getTenantIdFor("account:create")
    const snakeCaseData = toSnakeCase(data)
    const result = await query(
      `INSERT INTO accounts 
       (tenant_id, name, type, balance, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tenantId, snakeCaseData.name, snakeCaseData.type, snakeCaseData.balance, snakeCaseData.description],
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
    const tenantId = await getTenantIdFor("account:update")
    const snakeCaseData = toSnakeCase(data)
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(snakeCaseData)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    updates.push(`updated_at = NOW()`)
    values.push(id, tenantId)

    const result = await query(
      `UPDATE accounts 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
       RETURNING *`,
      values,
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
    const tenantId = await getTenantIdFor("account:delete")
    await query(`DELETE FROM accounts WHERE id = $1 AND tenant_id = $2`, [id, tenantId])

    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting account:", error)
    return false
  }
}

export async function exportReportingSnapshot(): Promise<string> {
  const tenantId = await getTenantIdFor("reporting:export")

  const [businessData, inventory, customers, transactions, accounts] = await Promise.all([
    query(`SELECT * FROM business_data WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1`, [tenantId]),
    query(`SELECT * FROM inventory_items WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]),
    query(`SELECT * FROM customers WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]),
    query(`SELECT * FROM transactions WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]),
    query(`SELECT * FROM accounts WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]),
  ])

  return JSON.stringify(
    {
      tenantId,
      generatedAt: new Date().toISOString(),
      businessData: toCamelCase(businessData.rows[0] ?? null),
      inventory: toCamelCase(inventory.rows),
      customers: toCamelCase(customers.rows),
      transactions: toCamelCase(transactions.rows),
      accounts: toCamelCase(accounts.rows),
    },
    null,
    2,
  )
}

export async function initializeDefaultBusinessData(): Promise<BusinessData | null> {
  try {
    const tenantId = await getTenantIdFor("business_data:write")
    const existingDataResult = await query(`SELECT * FROM business_data WHERE tenant_id = $1 LIMIT 1`, [tenantId])

    if (existingDataResult.rows.length === 0) {
      const result = await query(
        `INSERT INTO business_data 
         (tenant_id, wholesale_price_per_oz, target_profit_per_month, operating_expenses) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [tenantId, 100, 2000, 500],
      )

      return toCamelCase(result.rows[0])
    }

    return toCamelCase(existingDataResult.rows[0])
  } catch (error) {
    console.error("Error initializing default business data:", error)
    return null
  }
}
