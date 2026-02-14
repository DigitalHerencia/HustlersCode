import type { Customer, Payment } from "@/lib/types"
import { applyPaymentToBalance, deriveCustomerStatus } from "@/src/domains/customers/domain/customer-rules"
import {
  createCustomerRecord,
  createPaymentRecord,
  deleteCustomerRecord,
  findCustomerById,
  findCustomers,
  findRawCustomerById,
  incrementCustomerAmountOwed,
  updateCustomerLedger,
  updateCustomerRecord,
} from "@/src/domains/customers/infrastructure/customers-repository"
import { withTransaction } from "@/src/domains/shared/infrastructure/db"

export async function listCustomers() {
  return findCustomers()
}

export async function getCustomerDetails(id: string) {
  return findCustomerById(id)
}

export async function createCustomer(data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">) {
  return createCustomerRecord(data)
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  await updateCustomerRecord(id, data)
  return findCustomerById(id)
}

export async function deleteCustomer(id: string) {
  await withTransaction(async () => {
    await deleteCustomerRecord(id)
  })
}

export async function addCustomerPayment(customerId: string, data: Omit<Payment, "id" | "createdAt" | "customerId">) {
  return withTransaction(async () => {
    const payment = await createPaymentRecord(customerId, data)
    const customer = await findRawCustomerById(customerId)

    if (customer) {
      const amountOwed = applyPaymentToBalance(customer.amount_owed, data.amount)
      const status = deriveCustomerStatus(amountOwed, data.amount)
      await updateCustomerLedger(customerId, amountOwed, status)
    }

    return payment
  })
}

export async function addCreditToCustomerBalance(customerId: string, amount: number) {
  await incrementCustomerAmountOwed(customerId, amount)
}
