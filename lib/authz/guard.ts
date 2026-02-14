import { query } from "@/lib/db"
import { roleHasAction } from "@/lib/authz/policy"
import { resolvePrincipal } from "@/lib/authz/context"
import type { AppRole, AuthPrincipal, AuthzAction } from "@/lib/authz/types"
import { AuthorizationError } from "@/lib/authz/types"

async function getBoundRoles(principal: AuthPrincipal): Promise<AppRole[]> {
  const result = await query(
    `SELECT role_slug
     FROM auth_role_bindings
     WHERE tenant_id = $1 AND principal_id = $2`,
    [principal.tenantId, principal.userId],
  )

  return result.rows.map((row: { role_slug: AppRole }) => row.role_slug)
}

export async function requireAuthorization(action: AuthzAction): Promise<AuthPrincipal> {
  const principal = await resolvePrincipal()

  if (!principal) {
    throw new AuthorizationError("Authentication context missing")
  }

  const boundRoles = await getBoundRoles(principal)
  const effectiveRoles = principal.claimRoles.filter((role) => boundRoles.includes(role))

  if (!effectiveRoles.some((role) => roleHasAction(role, action))) {
    throw new AuthorizationError(`Access denied for action: ${action}`)
  }

  return principal
}
