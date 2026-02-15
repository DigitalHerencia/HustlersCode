import { query } from "@/lib/db"
import type { AppRole } from "@/lib/authz/types"

export interface TenantRoleClaim {
  tenantId: string
  roles: AppRole[]
}

export interface ClerkRoleSyncPayload {
  clerkUserId: string
  tenantRoles: TenantRoleClaim[]
}

export async function syncClerkRoleClaims(payload: ClerkRoleSyncPayload): Promise<void> {
  await query("BEGIN")
  try {
    await query(`DELETE FROM auth_role_bindings WHERE principal_id = $1`, [payload.clerkUserId])

    for (const tenant of payload.tenantRoles) {
      for (const role of tenant.roles) {
        await query(
          `INSERT INTO auth_role_bindings (tenant_id, principal_id, role_slug, source)
           VALUES ($1, $2, $3, 'clerk_private_metadata')
           ON CONFLICT (tenant_id, principal_id, role_slug) DO UPDATE
           SET source = EXCLUDED.source,
               updated_at = NOW()`,
          [tenant.tenantId, payload.clerkUserId, role],
        )
      }
    }

    await query("COMMIT")
  } catch (error) {
    await query("ROLLBACK")
    throw error
  }
}
