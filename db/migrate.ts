// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

import { query, pool } from "@/lib/db"

async function migrate() {
  // Skip migration in browser environment
  if (isBrowser) {
    console.log("Migration skipped in browser environment")
    return
  }

  console.log("Starting database migration...")

  try {
    // Import fs and path dynamically only on server
    const fs = await import("fs")
    const path = await import("path")

    // Create a migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `)

    // Read the schema file
    const schemaPath = path.join(process.cwd(), "db", "schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Execute the schema
    await query(schema)

    // Record the migration
    await query(`INSERT INTO migrations (name) VALUES ($1) ON CONFLICT DO NOTHING`, [
      "initial_schema_" + new Date().toISOString().split("T")[0],
    ])

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  } finally {
    // Close the pool
    await pool.end()
  }
}

// Run the migration if this file is executed directly
if (!isBrowser && typeof require !== "undefined" && require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export default migrate
