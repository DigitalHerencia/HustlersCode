import { v4 as uuidv4 } from "uuid"
import { defaultBusinessData, sampleInventory, sampleCustomers } from "./data"
import type { BusinessData, InventoryItem, Customer, Payment, Transaction, Account } from "./types"

// Generate demo data for the application
export function generateDemoData() {
  // Create business data
  const businessData: BusinessData = {
    ...defaultBusinessData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Create inventory items
  const inventoryItems: InventoryItem[] = sampleInventory.map((item) => ({
    ...item,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  // Create customers with payment history
  const customers: Customer[] = []
  const payments: Payment[] = []

  sampleCustomers.forEach((customer) => {
    const customerId = uuidv4()

    // Create customer
    const newCustomer = {
      ...customer,
      id: customerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentHistory: [],
    }

    // Add payment history if customer has outstanding balance
    if (customer.amountOwed > 0) {
      // Create a partial payment
      const paymentId = uuidv4()
      const payment = {
        id: paymentId,
        customerId: customerId,
        amount: customer.amountOwed * 0.5, // 50% payment
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        method: "cash",
        notes: "Partial payment",
        createdAt: new Date().toISOString(),
      }

      payments.push(payment)
      newCustomer.paymentHistory.push(payment)
    }

    customers.push(newCustomer)
  })

  // Create transactions
  const transactions: Transaction[] = []

  // Sample sale transaction
  if (inventoryItems.length > 0 && customers.length > 0) {
    const transaction = {
      id: uuidv4(),
      date: new Date().toISOString(),
      type: "sale",
      inventoryId: inventoryItems[0].id,
      inventoryName: inventoryItems[0].name,
      quantityGrams: 3.5,
      pricePerGram: 15,
      totalPrice: 52.5,
      cost: 10,
      profit: 42.5,
      paymentMethod: "cash",
      customerId: customers[0].id,
      customerName: customers[0].name,
      notes: "Regular sale",
    }

    transactions.push(transaction)
  }

  // Create accounts
  const accounts: Account[] = [
    {
      id: uuidv4(),
      name: "Cash on Hand",
      type: "asset",
      balance: 1500,
      description: "Physical cash in the register",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: "Bank Account",
      type: "asset",
      balance: 5000,
      description: "Business checking account",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: "Accounts Receivable",
      type: "asset",
      balance: customers.reduce((total, customer) => total + customer.amountOwed, 0),
      description: "Money owed by customers",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  return {
    businessData,
    inventoryItems,
    customers,
    payments,
    transactions,
    accounts,
  }
}
