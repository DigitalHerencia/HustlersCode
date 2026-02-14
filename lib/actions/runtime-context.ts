import "server-only"

import { headers } from "next/headers"

import type { MutationContext, RbacRole } from "@/lib/actions/context"

const DEV_FALLBACK_CONTEXT: MutationContext = {
  userId: "dev-user",
  tenantId: "dev-tenant",
  roles: ["owner"],
}

export async function resolveMutationContext(): Promise<MutationContext> {
  const requestHeaders = headers()

  const userId = requestHeaders.get("x-user-id") ?? process.env.DEV_USER_ID
  const tenantId = requestHeaders.get("x-tenant-id") ?? process.env.DEV_TENANT_ID
  const rolesRaw = requestHeaders.get("x-user-roles") ?? process.env.DEV_USER_ROLES

  const roles = (rolesRaw?.split(",").map((role) => role.trim()).filter(Boolean) ?? []) as RbacRole[]

  if (userId && tenantId) {
    return {
      userId,
      tenantId,
      roles: roles.length > 0 ? roles : ["editor"],
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK_CONTEXT
  }

  throw new Error("Unauthorized mutation: request is missing auth/tenant context headers")
}
