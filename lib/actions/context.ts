import "server-only"

export type RbacRole = "owner" | "admin" | "editor"

export interface MutationContext {
  userId: string
  tenantId: string
  roles: RbacRole[]
}

function hasRole(context: MutationContext, allowedRoles: readonly RbacRole[]) {
  return context.roles.some((role) => allowedRoles.includes(role))
}

export function assertMutationContext(
  context: MutationContext,
  permission: string,
  allowedRoles: readonly RbacRole[] = ["owner", "admin"],
): void {
  if (!context.userId) {
    throw new Error(`Unauthorized mutation (${permission}): missing user context`)
  }

  if (!context.tenantId) {
    throw new Error(`Unauthorized mutation (${permission}): missing tenant context`)
  }

  if (!hasRole(context, allowedRoles)) {
    throw new Error(`Forbidden mutation (${permission}): insufficient RBAC role`)
  }
}
