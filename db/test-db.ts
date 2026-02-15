import fs from "node:fs"
import path from "node:path"

import { Pool } from "pg"

type EnvInput = NodeJS.ProcessEnv | Record<string, string | undefined>

export function resolveTestDatabaseUrl(env: EnvInput): string {
  const testDatabaseUrl = env.TEST_DATABASE_URL ?? env.DATABASE_URL

  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL or DATABASE_URL must be configured")
  }

  return testDatabaseUrl
}

async function runSqlFile(pool: Pool, relativePath: string) {
  const sqlPath = path.join(process.cwd(), relativePath)
  const sql = fs.readFileSync(sqlPath, "utf-8")
  await pool.query(sql)
}

export async function resetTestDatabase() {
  const connectionString = resolveTestDatabaseUrl(process.env)
  const pool = new Pool({ connectionString })

  try {
    await runSqlFile(pool, "db/schema.sql")
    await runSqlFile(pool, "db/test/reset.sql")
  } finally {
    await pool.end()
  }
}

export async function seedTestDatabase() {
  const connectionString = resolveTestDatabaseUrl(process.env)
  const pool = new Pool({ connectionString })

  try {
    await runSqlFile(pool, "db/test/seed.sql")
  } finally {
    await pool.end()
  }
}

export async function resetAndSeedTestDatabase() {
  await resetTestDatabase()
  await seedTestDatabase()
}

async function runFromCli() {
  const mode = process.argv[2]

  if (mode === "reset") {
    await resetTestDatabase()
    return
  }

  if (mode === "seed") {
    await seedTestDatabase()
    return
  }

  await resetAndSeedTestDatabase()
}

if (process.argv[1]?.includes("test-db.ts")) {
  runFromCli().catch((error) => {
    console.error("Test database command failed", error)
    process.exit(1)
  })
}
