import { headers } from "next/headers"
import type { AppRole, AuthPrincipal } from "@/lib/authz/types"

let testPrincipal: AuthPrincipal | null = null

const isAppRole = (value: string): value is AppRole =>
  ["owner", "admin", "analyst", "operator", "viewer"].includes(value)

export function setAuthorizationTestContext(principal: AuthPrincipal | null) {
  testPrincipal = principal
}

export async function resolvePrincipal(): Promise<AuthPrincipal | null> {
  if (testPrincipal) {
    return testPrincipal
  }

  const h = headers()
  const userId = h.get("x-clerk-user-id") ?? h.get("x-user-id")
  const tenantId = h.get("x-tenant-id")
  const rawRoles = h.get("x-clerk-roles") ?? h.get("x-user-roles")

  if (!userId || !tenantId) {
    return null
  }

  const claimRoles = rawRoles
    ? rawRoles
        .split(",")
        .map((role) => role.trim())
        .filter(isAppRole)
    : []

  return {
    userId,
    tenantId,
    claimRoles,
  }
}
