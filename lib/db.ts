// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Browser-compatible database implementation
const createBrowserDb = () => {
  // In-memory database for browser preview
  const db = {
    business_data: [
      {
        id: "1",
        wholesale_price_per_oz: 100,
        target_profit_per_month: 2000,
        operating_expenses: 500,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    inventory_items: [
      {
        id: "1",
        name: "Premium Product",
        description: "High quality product",
        quantity_g: 500,
        quantity_oz: 17.64,
        quantity_kg: 0.5,
        purchase_date: new Date().toISOString(),
        cost_per_oz: 80,
        total_cost: 1411.2,
        reorder_threshold_g: 100,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    customers: [
      {
        id: "1",
        name: "John Doe",
        phone: "555-123-4567",
        email: "john@example.com",
        address: "123 Main St",
        amount_owed: 150,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "unpaid",
        notes: "Regular customer",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    payments: [],
    transactions: [],
    accounts: [
      {
        id: "1",
        name: "Cash on Hand",
        type: "asset",
        balance: 1500,
        description: "Physical cash in the register",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    scenarios: [],
    salespeople: [],
  }

  // Mock query function for browser
  const query = async (text: string, params: any[] = []) => {
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

    // Default response
    return { rows: [] }
  }

  // Mock pool for browser
  const pool = {
    query: query,
    end: async () => console.log("Browser DB connection closed"),
    on: (event: string, callback: Function) => {
      if (event === "connect") {
        callback()
      }
    },
  }

  return { pool, query }
}

// Server database implementation (only loaded on server)
const createServerDb = async () => {
  // Dynamic import only on server
  if (!isBrowser) {
    try {
      const { Pool } = await import("pg")

      // Create a connection pool
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })

      // Helper function for database queries
      const query = async (text: string, params: any[] = []) => {
        const start = Date.now()
        try {
          const res = await pool.query(text, params)
          const duration = Date.now() - start

          // Log slow queries in development
          if (process.env.NODE_ENV !== "production" && duration > 100) {
            console.log("Slow query:", { text, duration, rows: res.rowCount })
          }

          return res
        } catch (error) {
          console.error("Database query error:", error)
          throw error
        }
      }

      return { pool, query }
    } catch (error) {
      console.error("Error importing pg:", error)
      // Fallback to browser implementation if import fails
      return createBrowserDb()
    }
  }

  // Return browser implementation
  return createBrowserDb()
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

// Initialize database connection
let dbInstance: { pool: any; query: any } | null = null

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await createServerDb()
  }
  return dbInstance
}

// Export async query function that uses the initialized connection
export async function query(text: string, params: any[] = []) {
  const db = await getDb()
  return db.query(text, params)
}

type TransactionClient = {
  query: (text: string, params?: any[]) => Promise<any>
  release?: () => void
}

export async function $transaction<T>(callback: (client: TransactionClient) => Promise<T>): Promise<T> {
  const db = await getDb()
  const pool = db.pool
  const client: TransactionClient = pool.connect ? await pool.connect() : { query: db.query }

  await client.query("BEGIN")

  try {
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    try {
      await client.query("ROLLBACK")
    } catch (rollbackError) {
      console.error("Database transaction rollback failed", {
        error,
        rollbackError,
      })
    }

    console.error("Database transaction failed", {
      error,
    })

    throw error
  } finally {
    if (client.release) {
      client.release()
    }
  }
}

// Export pool for compatibility
export const pool = {
  query: async (text: string, params: any[] = []) => {
    const db = await getDb()
    return db.pool.query(text, params)
  },
  end: async () => {
    const db = await getDb()
    if (db.pool.end) {
      return db.pool.end()
    }
  },
  on: (event: string, callback: Function) => {
    // This is a simplified version for browser compatibility
    if (event === "connect") {
      callback()
    }
  },
}
