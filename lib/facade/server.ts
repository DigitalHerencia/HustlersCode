"use server"

import "server-only"

import type { Account, BusinessData, Customer, InventoryItem, Payment, ScenarioData, Transaction } from "@/lib/types"
import * as read from "@/lib/read/core"
import * as mutation from "@/lib/actions/mutations"
import { resolveMutationContext } from "@/lib/actions/runtime-context"

export const getBusinessData = read.getBusinessData
export const getScenarios = read.getScenarios
export const getScenario = read.getScenario
export const getInventory = read.getInventory
export const getCustomers = read.getCustomers
export const getCustomer = read.getCustomer
export const getTransactions = read.getTransactions
export const getAccounts = read.getAccounts

export async function saveBusinessData(data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">) {
  return mutation.saveBusinessData(await resolveMutationContext(), data)
}

export async function updateBusinessData(id: string, data: Partial<BusinessData>) {
  return mutation.updateBusinessData(await resolveMutationContext(), id, data)
}

export async function createScenario(data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">) {
  return mutation.createScenario(await resolveMutationContext(), data)
}

export async function updateScenario(id: string, data: Partial<ScenarioData>) {
  return mutation.updateScenario(await resolveMutationContext(), id, data)
}

export async function deleteScenario(id: string) {
  return mutation.deleteScenario(await resolveMutationContext(), id)
}

export async function createInventoryItem(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) {
  return mutation.createInventoryItem(await resolveMutationContext(), data)
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>) {
  return mutation.updateInventoryItem(await resolveMutationContext(), id, data)
}

export async function deleteInventoryItem(id: string) {
  return mutation.deleteInventoryItem(await resolveMutationContext(), id)
}

export async function createCustomer(data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">) {
  return mutation.createCustomer(await resolveMutationContext(), data)
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  return mutation.updateCustomer(await resolveMutationContext(), id, data)
}

export async function deleteCustomer(id: string) {
  return mutation.deleteCustomer(await resolveMutationContext(), id)
}

export async function addPayment(customerId: string, data: Omit<Payment, "id" | "createdAt" | "customerId">) {
  return mutation.addPayment(await resolveMutationContext(), customerId, data)
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">) {
  return mutation.createTransaction(await resolveMutationContext(), data)
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">) {
  return mutation.createAccount(await resolveMutationContext(), data)
}

export async function updateAccount(id: string, data: Partial<Account>) {
  return mutation.updateAccount(await resolveMutationContext(), id, data)
}

export async function deleteAccount(id: string) {
  return mutation.deleteAccount(await resolveMutationContext(), id)
}

export async function initializeDefaultBusinessData() {
  return mutation.initializeDefaultBusinessData(await resolveMutationContext())
}
