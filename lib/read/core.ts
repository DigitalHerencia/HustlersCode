import "server-only"

import { query, toCamelCase } from "@/lib/db"
import type { Account, BusinessData, Customer, InventoryItem, ScenarioData, Transaction } from "@/lib/types"

// Query-only module: no INSERT/UPDATE/DELETE statements are allowed in this module.
export async function getBusinessData(): Promise<BusinessData | null> {
  const result = await query(`SELECT * FROM business_data ORDER BY created_at DESC LIMIT 1`)
  return result.rows[0] ? toCamelCase(result.rows[0]) : null
}

export async function getScenarios(): Promise<ScenarioData[]> {
  const scenariosResult = await query(`SELECT * FROM scenarios ORDER BY created_at DESC`)
  const scenarios = toCamelCase(scenariosResult.rows)

  for (const scenario of scenarios) {
    const salespeopleResult = await query(`SELECT * FROM salespeople WHERE scenario_id = $1`, [scenario.id])
    scenario.salespeople = toCamelCase(salespeopleResult.rows)
  }

  return scenarios
}

export async function getScenario(id: string): Promise<ScenarioData | null> {
  const scenarioResult = await query(`SELECT * FROM scenarios WHERE id = $1`, [id])
  if (!scenarioResult.rows[0]) {
    return null
  }

  const scenario = toCamelCase(scenarioResult.rows[0])
  const salespeopleResult = await query(`SELECT * FROM salespeople WHERE scenario_id = $1`, [id])
  scenario.salespeople = toCamelCase(salespeopleResult.rows)

  return scenario
}

export async function getInventory(): Promise<InventoryItem[]> {
  const result = await query(`SELECT * FROM inventory_items ORDER BY created_at DESC`)
  return toCamelCase(result.rows)
}

export async function getCustomers(): Promise<Customer[]> {
  const customersResult = await query(`SELECT * FROM customers ORDER BY created_at DESC`)
  const customers = toCamelCase(customersResult.rows)

  for (const customer of customers) {
    const paymentsResult = await query(`SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC`, [customer.id])
    customer.payments = toCamelCase(paymentsResult.rows)
  }

  return customers
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const customerResult = await query(`SELECT * FROM customers WHERE id = $1`, [id])
  if (!customerResult.rows[0]) {
    return null
  }

  const customer = toCamelCase(customerResult.rows[0])
  const paymentsResult = await query(`SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC`, [id])
  customer.payments = toCamelCase(paymentsResult.rows)

  return customer
}

export async function getTransactions(): Promise<Transaction[]> {
  const result = await query(`SELECT * FROM transactions ORDER BY created_at DESC`)
  return toCamelCase(result.rows)
}

export async function getAccounts(): Promise<Account[]> {
  const result = await query(`SELECT * FROM accounts ORDER BY created_at DESC`)
  return toCamelCase(result.rows)
}
