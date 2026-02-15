import type { AppRole, AuthzAction } from "@/lib/authz/types"

const rolePermissions: Record<AppRole, AuthzAction[]> = {
  owner: [
    "business_data:write",
    "scenario:create",
    "scenario:update",
    "scenario:delete",
    "inventory:create",
    "inventory:update",
    "inventory:delete",
    "customer:create",
    "customer:update",
    "customer:delete",
    "payment:create",
    "transaction:create",
    "account:create",
    "account:update",
    "account:delete",
    "sensitive:read",
    "reporting:export",
  ],
  admin: [
    "business_data:write",
    "scenario:create",
    "scenario:update",
    "scenario:delete",
    "inventory:create",
    "inventory:update",
    "inventory:delete",
    "customer:create",
    "customer:update",
    "customer:delete",
    "payment:create",
    "transaction:create",
    "account:create",
    "account:update",
    "account:delete",
    "sensitive:read",
    "reporting:export",
  ],
  analyst: ["sensitive:read", "reporting:export"],
  operator: [
    "scenario:create",
    "scenario:update",
    "inventory:create",
    "inventory:update",
    "customer:create",
    "customer:update",
    "payment:create",
    "transaction:create",
    "sensitive:read",
  ],
  viewer: ["sensitive:read"],
}

export function roleHasAction(role: AppRole, action: AuthzAction): boolean {
  return rolePermissions[role].includes(action)
}
