import { v4 as uuidv4 } from "uuid"
import { defaultBusinessData, sampleInventory, sampleCustomers } from "./data"

// In-memory database for browser preview
const db = {
  business_data: [{ ...defaultBusinessData, id: uuidv4() }],
  inventory_items: sampleInventory.map((item) => ({
    ...item,
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
  })),
  customers: sampleCustomers.map((customer) => ({
    ...customer,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payments: [],
  })),
  payments: [],
  transactions: [],
  accounts: [
    {
      id: uuidv4(),
      name: "Cash on Hand",
      type: "asset",
      balance: 1500,
      description: "Physical cash in the register",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      name: "Bank Account",
      type: "asset",
      balance: 5000,
      description: "Business checking account",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  scenarios: [],
  salespeople: [],
}

// Mock query function for browser
export async function query(text: string, params: any[] = []) {
  console.log("Browser DB Query:", text, params)

  // Simple query parser for browser preview
  if (text.toLowerCase().includes("select * from business_data")) {
    return { rows: db.business_data }
  }

  if (text.toLowerCase().includes("select * from inventory_items")) {
    return { rows: db.inventory_items }
  }

  if (text.toLowerCase().includes("select * from customers")) {
    return { rows: db.customers }
  }

  if (text.toLowerCase().includes("select * from payments")) {
    return { rows: db.payments }
  }

  if (text.toLowerCase().includes("select * from transactions")) {
    return { rows: db.transactions }
  }

  if (text.toLowerCase().includes("select * from accounts")) {
    return { rows: db.accounts }
  }

  if (text.toLowerCase().includes("select * from scenarios")) {
    return { rows: db.scenarios }
  }

  if (text.toLowerCase().includes("select * from salespeople")) {
    return { rows: db.salespeople }
  }

  // Handle inserts
  if (text.toLowerCase().includes("insert into business_data")) {
    const newItem = {
      id: uuidv4(),
      wholesale_price_per_oz: params[0],
      target_profit_per_month: params[1],
      operating_expenses: params[2],
      created_at: new Date(),
      updated_at: new Date(),
    }
    db.business_data.push(newItem)
    return { rows: [newItem] }
  }

  // Default response
  return { rows: [] }
}

// Helper function to map database column names to camelCase
export function toCamelCase(obj: any) {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }

  return Object.keys(obj).reduce((result, key) => {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = toCamelCase(obj[key])
    return result
  }, {} as any)
}

// Helper function to map camelCase to database column names (snake_case)
export function toSnakeCase(obj: any) {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }

  return Object.keys(obj).reduce((result, key) => {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    result[snakeKey] = toSnakeCase(obj[key])
    return result
  }, {} as any)
}

// Mock pool for browser
export const pool = {
  query: query,
  end: async () => console.log("Browser DB connection closed"),
  on: (event: string, callback: Function) => {
    if (event === "connect") {
      callback()
    }
  },
}
