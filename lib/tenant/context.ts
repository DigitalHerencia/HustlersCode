import { headers } from "next/headers"
import { query } from "@/lib/db"
import { deriveTenantLookupDomain, normalizeRequestHost } from "@/lib/tenant/host"

export interface TenantContext {
  tenantId: string
  tenantSlug: string
  domain: string
}

export async function resolveTenantContext(): Promise<TenantContext> {
  const requestHeaders = headers()
  const forwardedHost = requestHeaders.get("x-tenant-host") ?? requestHeaders.get("x-forwarded-host")
  const host = normalizeRequestHost(forwardedHost ?? requestHeaders.get("host"))

  if (!host) {
    throw new Error("Tenant resolution failed: missing host header")
  }

  const domain = deriveTenantLookupDomain(host)
  const result = await query(
    `SELECT t.id, t.slug, td.domain
     FROM tenant_domains td
     INNER JOIN tenants t ON t.id = td.tenant_id
     WHERE td.domain = $1 AND t.is_active = TRUE
     LIMIT 1`,
    [domain],
  )

  if (result.rows.length === 0) {
    throw new Error(`Tenant resolution failed for domain: ${domain}`)
  }

  const row = result.rows[0]

  return {
    tenantId: row.id,
    tenantSlug: row.slug,
    domain: row.domain,
  }
}
