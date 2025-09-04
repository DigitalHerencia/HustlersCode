"use client"

import { useState } from "react"
import { HustleTip } from "@/components/hustle-tip"
import { Button } from "@/components/ui/button"
import CustomerList from "@/components/customer-list"
import CustomerDetails from "@/components/customer-details"
import CustomerForm from "@/components/customer-form"
import PaymentForm from "@/components/payment-form"
import CustomerAnalytics from "@/components/customer-analytics"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Customer, Payment } from "@/lib/data"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CustomersTabProps {
  customers: Customer[]
  onUpdateCustomers: (customers: Customer[]) => void
  showTips: boolean
  onHideTips: () => void
}

export default function CustomersTab({ customers, onUpdateCustomers, showTips, onHideTips }: CustomersTabProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Handle adding a new customer
  const handleAddCustomer = (customer: Customer) => {
    onUpdateCustomers([...customers, customer])
  }

  // Handle updating a customer
  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    onUpdateCustomers(customers.map((customer) => (customer.id === updatedCustomer.id ? updatedCustomer : customer)))
    setSelectedCustomer(updatedCustomer)
  }

  // Handle deleting a customer
  const handleDeleteCustomer = () => {
    if (!selectedCustomer) return

    onUpdateCustomers(customers.filter((customer) => customer.id !== selectedCustomer.id))
    setSelectedCustomer(null)
    setIsDeleteDialogOpen(false)
  }

  // Handle adding a payment
  const handleAddPayment = (payment: Payment) => {
    if (!selectedCustomer) return

    // Calculate remaining amount after payment
    const newAmountOwed = Math.max(0, selectedCustomer.amountOwed - payment.amount)

    // Determine new status
    let newStatus: "paid" | "partial" | "unpaid" = "unpaid"
    if (newAmountOwed === 0) {
      newStatus = "paid"
    } else if (payment.amount > 0) {
      newStatus = "partial"
    }

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      amountOwed: newAmountOwed,
      status: newStatus,
      paymentHistory: [...selectedCustomer.paymentHistory, payment],
      updatedAt: new Date().toISOString(),
    }

    handleUpdateCustomer(updatedCustomer)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold graffiti-font text-shadow">CLIENTS</h1>
          <p className="text-white/80 mt-1">GET YOUR MONEY. NO EXCEPTIONS.</p>
        </div>

        {showTips && (
          <HustleTip title="COLLECTING DEBTS">
            <p>
              Track who owes you and when it's due. In this game, respect comes from getting paid on time. Always follow
              up on late payments - money owed is money lost until it's in your pocket.
            </p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={onHideTips}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      <Tabs
        value={showAnalytics ? "analytics" : "client-list"}
        onValueChange={(value) => setShowAnalytics(value === "analytics")}
        className="w-full mb-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client-list" className="gangster-font">
            CLIENT LIST
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gangster-font">
            ANALYTICS
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {showAnalytics ? (
        <CustomerAnalytics customers={customers} />
      ) : selectedCustomer ? (
        <div className="space-y-4">
          <Button variant="outline" className="button-sharp" onClick={() => setSelectedCustomer(null)}>
            ← BACK TO CLIENT LIST
          </Button>

          <CustomerDetails
            customer={selectedCustomer}
            onEdit={() => setIsEditCustomerOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onAddPayment={() => setIsPaymentOpen(true)}
          />
        </div>
      ) : (
        <CustomerList
          customers={customers}
          onSelectCustomer={setSelectedCustomer}
          onAddCustomer={() => setIsAddCustomerOpen(true)}
        />
      )}

      {/* Add Customer Form */}
      <CustomerForm isOpen={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} onSave={handleAddCustomer} />

      {/* Edit Customer Form */}
      {selectedCustomer && (
        <CustomerForm
          isOpen={isEditCustomerOpen}
          onClose={() => setIsEditCustomerOpen(false)}
          onSave={handleUpdateCustomer}
          initialData={selectedCustomer}
        />
      )}

      {/* Payment Form */}
      {selectedCustomer && (
        <PaymentForm
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSave={handleAddPayment}
          customer={selectedCustomer}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-smoke border-gold card-sharp">
          <AlertDialogHeader>
            <AlertDialogTitle className="gangster-font text-gold">DELETE CLIENT</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
              {selectedCustomer?.amountOwed > 0 && (
                <span className="block mt-2 text-blood">
                  Warning: This client still owes {selectedCustomer?.amountOwed.toFixed(2)}. Deleting will remove all
                  payment records.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="button-sharp">CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              className="bg-blood hover:bg-blood/90 text-white button-sharp"
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
