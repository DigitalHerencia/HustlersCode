import { query, toCamelCase, toSnakeCase } from "@/lib/db"

export { toCamelCase, toSnakeCase }

export async function dbQuery<T = any>(text: string, params: unknown[] = []): Promise<{ rows: T[] }> {
  return query(text, params)
}

export async function withTransaction<T>(work: () => Promise<T>): Promise<T> {
  await dbQuery("BEGIN")
  try {
    const result = await work()
    await dbQuery("COMMIT")
    return result
  } catch (error) {
    await dbQuery("ROLLBACK")
    throw error
  }
}
