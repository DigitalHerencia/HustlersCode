export type AppRole = "owner" | "admin" | "analyst" | "operator" | "viewer"

export type AuthzAction =
  | "business_data:write"
  | "scenario:create"
  | "scenario:update"
  | "scenario:delete"
  | "inventory:create"
  | "inventory:update"
  | "inventory:delete"
  | "customer:create"
  | "customer:update"
  | "customer:delete"
  | "payment:create"
  | "transaction:create"
  | "account:create"
  | "account:update"
  | "account:delete"
  | "sensitive:read"
  | "reporting:export"

export interface AuthPrincipal {
  userId: string
  tenantId: string
  claimRoles: AppRole[]
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthorizationError"
  }
}
