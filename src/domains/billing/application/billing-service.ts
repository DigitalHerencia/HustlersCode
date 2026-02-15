import type { Account, Transaction } from "@/lib/types"
import { addCreditToCustomerBalance } from "@/src/domains/customers/application/customers-service"
import { decrementInventoryForSale } from "@/src/domains/inventory/application/inventory-service"
import {
  createAccountRecord,
  createTransactionRecord,
  deleteAccountRecord,
  findAccounts,
  findTransactions,
  updateAccountRecord,
} from "@/src/domains/billing/infrastructure/billing-repository"
import { withTransaction } from "@/src/domains/shared/infrastructure/db"

export async function listTransactions() {
  return findTransactions()
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">) {
  return withTransaction(async () => {
    const transaction = await createTransactionRecord(data)

    if (data.type === "sale" && data.inventoryId) {
      await decrementInventoryForSale(data.inventoryId, data.quantityGrams)
    }

    if (data.type === "sale" && data.customerId && data.paymentMethod === "credit") {
      await addCreditToCustomerBalance(data.customerId, data.totalPrice)
    }

    return transaction
  })
}

export async function listAccounts() {
  return findAccounts()
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">) {
  return createAccountRecord(data)
}

export async function updateAccount(id: string, data: Partial<Account>) {
  return updateAccountRecord(id, data)
}

export async function deleteAccount(id: string) {
  await deleteAccountRecord(id)
}
