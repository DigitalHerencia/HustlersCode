"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"
import type { Account, Payment } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import { getAccounts, createAccount, updateAccount, deleteAccount } from "@/app/actions"

interface AccountsTableProps {
  onAddPayment?: (accountId: string, payment: Payment) => void
}

const accountFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  amountOwed: z.coerce.number().positive("Amount must be positive"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  dueDate: z.string().min(1, "Due date is required"),
})

const paymentFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Payment date is required"),
})

export default function AccountsTable({ onAddPayment }: AccountsTableProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [payingAccount, setPayingAccount] = useState<Account | null>(null)
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load accounts from database
  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true)
      try {
        const data = await getAccounts()
        setAccounts(data)
      } catch (error) {
        console.error("Error loading accounts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAccounts()
  }, [])

  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      customerName: "",
      amountOwed: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    },
  })

  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    },
  })

  const handleAddAccount = async (values: z.infer<typeof accountFormSchema>) => {
    setIsLoading(true)

    try {
      const newAccount = {
        name: values.customerName,
        balance: values.amountOwed,
        type: "asset",
        description: `Account created on ${values.purchaseDate}, due on ${values.dueDate}`,
      }

      const created = await createAccount(newAccount)

      if (created) {
        setAccounts([...accounts, created])
        setIsAddDialogOpen(false)
        accountForm.reset()
      }
    } catch (error) {
      console.error("Error adding account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditAccount = async (values: z.infer<typeof accountFormSchema>) => {
    if (!editingAccount) return

    setIsLoading(true)

    try {
      const updatedAccount = {
        name: values.customerName,
        balance: values.amountOwed,
        description: `Account updated on ${values.purchaseDate}, due on ${values.dueDate}`,
      }

      const updated = await updateAccount(editingAccount.id, updatedAccount)

      if (updated) {
        setAccounts(accounts.map((account) => (account.id === updated.id ? updated : account)))
        setIsEditDialogOpen(false)
        setEditingAccount(null)
      }
    } catch (error) {
      console.error("Error updating account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPayment = async (values: z.infer<typeof paymentFormSchema>) => {
    if (!payingAccount) return

    setIsLoading(true)

    try {
      const payment = {
        amount: values.amount,
        date: values.date,
        method: "cash",
        notes: `Payment for account ${payingAccount.name}`,
      }

      // Update account balance
      const newBalance = Math.max(0, payingAccount.balance - values.amount)
      const updated = await updateAccount(payingAccount.id, { balance: newBalance })

      if (updated) {
        setAccounts(accounts.map((account) => (account.id === updated.id ? updated : account)))

        // Call the onAddPayment prop if provided
        if (onAddPayment) {
          onAddPayment(payingAccount.id, {
            id: Date.now().toString(), // Temporary ID until saved
            date: values.date,
            amount: values.amount,
            method: "cash",
            notes: `Payment for account ${payingAccount.name}`,
          })
        }

        setIsPaymentDialogOpen(false)
        setPayingAccount(null)
        paymentForm.reset()
      }
    } catch (error) {
      console.error("Error adding payment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (account: Account) => {
    setEditingAccount(account)
    accountForm.reset({
      customerName: account.name,
      amountOwed: account.balance,
      purchaseDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })
    setIsEditDialogOpen(true)
  }

  const openPaymentDialog = (account: Account) => {
    setPayingAccount(account)
    paymentForm.reset({
      amount: account.balance,
      date: new Date().toISOString().split("T")[0],
    })
    setIsPaymentDialogOpen(true)
  }

  const handleDeleteAccount = async (id: string) => {
    setIsLoading(true)

    try {
      const success = await deleteAccount(id)

      if (success) {
        setAccounts(accounts.filter((account) => account.id !== id))
      }
    } catch (error) {
      console.error("Error deleting account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpandAccount = (accountId: string) => {
    setExpandedAccountId(expandedAccountId === accountId ? null : accountId)
  }

  const totalReceivables = accounts
    .filter((account) => account.type === "asset")
    .reduce((sum, account) => sum + account.balance, 0)

  const overdueAccounts = accounts.filter((account) => account.type === "asset" && account.balance > 0)

  const totalOverdue = overdueAccounts.reduce((sum, account) => sum + account.balance, 0)

  if (isLoading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Accounts Receivable</CardTitle>
            <CardDescription>Track customer accounts and payments</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>Enter the details of the new customer account.</DialogDescription>
              </DialogHeader>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(handleAddAccount)} className="space-y-4">
                  <FormField
                    control={accountForm.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="amountOwed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Owed</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={accountForm.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Account"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatCurrency(totalReceivables)}</div>
                <p className="text-sm text-muted-foreground">Total Receivables</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{overdueAccounts.length}</div>
                <p className="text-sm text-muted-foreground">Overdue Accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatCurrency(totalOverdue)}</div>
                <p className="text-sm text-muted-foreground">Total Overdue Amount</p>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No accounts found. Add an account to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <>
                      <TableRow key={account.id}>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toggleExpandAccount(account.id)}>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expandedAccountId === account.id ? "rotate-180" : ""
                              }`}
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{formatCurrency(account.balance)}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell>
                          {account.balance === 0 ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Paid
                            </Badge>
                          ) : account.balance > 0 ? (
                            <Badge variant="destructive">Outstanding</Badge>
                          ) : (
                            <Badge variant="outline">No Balance</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openPaymentDialog(account)}
                              disabled={account.balance === 0 || isLoading}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(account)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteAccount(account.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedAccountId === account.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/50 p-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Account Details</h4>
                              <p className="text-sm">{account.description}</p>
                              <p className="text-sm text-muted-foreground">
                                Created: {new Date(account.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Last Updated: {new Date(account.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update the details of this customer account.</DialogDescription>
          </DialogHeader>
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(handleEditAccount)} className="space-y-4">
              <FormField
                control={accountForm.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name="amountOwed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Owed</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={accountForm.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Account"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment for {payingAccount?.name || "this customer"}.</DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handleAddPayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormDescription>Current balance: {formatCurrency(payingAccount?.balance || 0)}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Record Payment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
