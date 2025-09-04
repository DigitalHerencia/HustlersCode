"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import type { Customer, Payment } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"

interface PaymentFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payment: Payment) => void
  customer: Customer
}

const formSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .refine((val) => val <= 1000000, {
      message: "Amount cannot exceed $1,000,000",
    }),
  date: z.string().min(1, "Payment date is required"),
  method: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
})

export default function PaymentForm({ isOpen, onClose, onSave, customer }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: customer.amountOwed,
      date: new Date().toISOString().split("T")[0],
      method: "cash",
      notes: "",
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const payment: Payment = {
      id: uuidv4(),
      amount: values.amount,
      date: values.date,
      method: values.method,
      notes: values.notes || "",
      createdAt: new Date().toISOString(),
    }

    onSave(payment)
    setIsLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-smoke border-gold card-sharp max-w-md">
        <DialogHeader>
          <DialogTitle className="gangster-font text-gold">RECORD PAYMENT</DialogTitle>
          <DialogDescription>
            Record a payment from {customer.name}. Current balance: {formatCurrency(customer.amountOwed)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">PAYMENT AMOUNT</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={customer.amountOwed}
                      className="input-sharp"
                    />
                  </FormControl>
                  <FormDescription>Maximum amount: {formatCurrency(customer.amountOwed)}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">PAYMENT DATE</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className="input-sharp" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">PAYMENT METHOD</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="crypto">Crypto</option>
                      <option value="other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">NOTES</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="input-sharp resize-none"
                      placeholder="Additional notes about this payment..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="bg-gold hover:bg-gold/90 text-black button-sharp">
                {isLoading ? "PROCESSING..." : "RECORD PAYMENT"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
