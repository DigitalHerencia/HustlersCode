import { query, toCamelCase } from "@/lib/db"

export class TenantRepository {
  constructor(private readonly tenantId: string) {}

  async list(table: string, orderBy = "created_at DESC") {
    const result = await query(`SELECT * FROM ${table} WHERE tenant_id = $1 ORDER BY ${orderBy}`, [this.tenantId])
    return toCamelCase(result.rows)
  }

  async getById(table: string, id: string) {
    const result = await query(`SELECT * FROM ${table} WHERE tenant_id = $1 AND id = $2`, [this.tenantId, id])
    return result.rows[0] ? toCamelCase(result.rows[0]) : null
  }

  async deleteById(table: string, id: string) {
    await query(`DELETE FROM ${table} WHERE tenant_id = $1 AND id = $2`, [this.tenantId, id])
  }

  async tenantQuery(text: string, params: unknown[] = []) {
    return query(text, [this.tenantId, ...params])
  }
}
