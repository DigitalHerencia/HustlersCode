import "server-only"

import type { Account, BusinessData, Customer, InventoryItem, Payment, ScenarioData, Transaction } from "@/lib/types"
import { assertMutationContext, type MutationContext } from "@/lib/actions/context"
import * as legacyActions from "@/app/actions"

// Mutation-only module. Every mutation must assert auth + tenant + RBAC context.
export async function saveBusinessData(
  context: MutationContext,
  data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">,
) {
  assertMutationContext(context, "business:write")
  return legacyActions.saveBusinessData(data)
}

export async function updateBusinessData(context: MutationContext, id: string, data: Partial<BusinessData>) {
  assertMutationContext(context, "business:write")
  return legacyActions.updateBusinessData(id, data)
}

export async function createScenario(context: MutationContext, data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">) {
  assertMutationContext(context, "scenario:write")
  return legacyActions.createScenario(data)
}

export async function updateScenario(context: MutationContext, id: string, data: Partial<ScenarioData>) {
  assertMutationContext(context, "scenario:write")
  return legacyActions.updateScenario(id, data)
}

export async function deleteScenario(context: MutationContext, id: string) {
  assertMutationContext(context, "scenario:delete")
  return legacyActions.deleteScenario(id)
}

export async function createInventoryItem(
  context: MutationContext,
  data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
) {
  assertMutationContext(context, "inventory:write")
  return legacyActions.createInventoryItem(data)
}

export async function updateInventoryItem(context: MutationContext, id: string, data: Partial<InventoryItem>) {
  assertMutationContext(context, "inventory:write")
  return legacyActions.updateInventoryItem(id, data)
}

export async function deleteInventoryItem(context: MutationContext, id: string) {
  assertMutationContext(context, "inventory:delete")
  return legacyActions.deleteInventoryItem(id)
}

export async function createCustomer(
  context: MutationContext,
  data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">,
) {
  assertMutationContext(context, "customer:write")
  return legacyActions.createCustomer(data)
}

export async function updateCustomer(context: MutationContext, id: string, data: Partial<Customer>) {
  assertMutationContext(context, "customer:write")
  return legacyActions.updateCustomer(id, data)
}

export async function deleteCustomer(context: MutationContext, id: string) {
  assertMutationContext(context, "customer:delete")
  return legacyActions.deleteCustomer(id)
}

export async function addPayment(
  context: MutationContext,
  customerId: string,
  data: Omit<Payment, "id" | "createdAt" | "customerId">,
) {
  assertMutationContext(context, "payment:write", ["owner", "admin", "editor"])
  return legacyActions.addPayment(customerId, data)
}

export async function createTransaction(context: MutationContext, data: Omit<Transaction, "id" | "createdAt">) {
  assertMutationContext(context, "transaction:write", ["owner", "admin", "editor"])
  return legacyActions.createTransaction(data)
}

export async function createAccount(context: MutationContext, data: Omit<Account, "id" | "createdAt" | "updatedAt">) {
  assertMutationContext(context, "account:write")
  return legacyActions.createAccount(data)
}

export async function updateAccount(context: MutationContext, id: string, data: Partial<Account>) {
  assertMutationContext(context, "account:write")
  return legacyActions.updateAccount(id, data)
}

export async function deleteAccount(context: MutationContext, id: string) {
  assertMutationContext(context, "account:delete")
  return legacyActions.deleteAccount(id)
}

export async function initializeDefaultBusinessData(context: MutationContext) {
  assertMutationContext(context, "business:initialize")
  return legacyActions.initializeDefaultBusinessData()
}
