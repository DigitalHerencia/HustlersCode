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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import type { Customer } from "@/lib/data"

interface CustomerFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (customer: Customer) => void
  initialData?: Customer | null
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  amountOwed: z.coerce.number().nonnegative("Amount must be non-negative"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
})

export default function CustomerForm({ isOpen, onClose, onSave, initialData }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      amountOwed: initialData?.amountOwed || 0,
      dueDate: initialData?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: initialData?.notes || "",
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    const customer: Customer = {
      id: initialData?.id || uuidv4(),
      name: values.name,
      phone: values.phone || "",
      email: values.email || "",
      address: values.address || "",
      amountOwed: values.amountOwed,
      dueDate: values.dueDate,
      status: values.amountOwed === 0 ? "paid" : "unpaid",
      paymentHistory: initialData?.paymentHistory || [],
      notes: values.notes || "",
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(customer)
    setIsLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-smoke border-gold card-sharp max-w-md">
        <DialogHeader>
          <DialogTitle className="gangster-font text-gold">
            {initialData ? "EDIT CLIENT" : "ADD NEW CLIENT"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the client's information and payment details."
              : "Enter the client's information and payment details."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">NAME</FormLabel>
                  <FormControl>
                    <Input {...field} className="input-sharp" placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">PHONE</FormLabel>
                    <FormControl>
                      <Input {...field} className="input-sharp" placeholder="555-123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">EMAIL</FormLabel>
                    <FormControl>
                      <Input {...field} className="input-sharp" placeholder="client@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">ADDRESS</FormLabel>
                  <FormControl>
                    <Input {...field} className="input-sharp" placeholder="123 Main St, City" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amountOwed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">AMOUNT OWED</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" className="input-sharp" placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">DUE DATE</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="input-sharp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      placeholder="Additional notes about this client..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="bg-gold hover:bg-gold/90 text-black button-sharp">
                {isLoading ? "SAVING..." : initialData ? "UPDATE CLIENT" : "ADD CLIENT"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
