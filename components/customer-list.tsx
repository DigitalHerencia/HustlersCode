"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, ChevronRight, AlertTriangle } from "lucide-react"
import type { Customer } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"

interface CustomerListProps {
  customers: Customer[]
  onSelectCustomer: (customer: Customer) => void
  onAddCustomer: () => void
}

export default function CustomerList({ customers, onSelectCustomer, onAddCustomer }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "unpaid" | "overdue" | "paid">("all")

  // Filter and search customers
  const filteredCustomers = customers.filter((customer) => {
    // Apply search
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase())

    // Apply filter
    if (filter === "all") return matchesSearch
    if (filter === "paid") return matchesSearch && customer.status === "paid"
    if (filter === "unpaid") return matchesSearch && (customer.status === "unpaid" || customer.status === "partial")
    if (filter === "overdue") {
      const dueDate = new Date(customer.dueDate)
      const today = new Date()
      return matchesSearch && (customer.status === "unpaid" || customer.status === "partial") && dueDate < today
    }

    return matchesSearch
  })

  // Sort customers: overdue first, then unpaid, then paid
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    // First sort by status
    if (a.status !== b.status) {
      if (a.status === "unpaid" && new Date(a.dueDate) < new Date()) return -1
      if (b.status === "unpaid" && new Date(b.dueDate) < new Date()) return 1
      if (a.status === "unpaid") return -1
      if (b.status === "unpaid") return 1
      if (a.status === "partial") return -1
      if (b.status === "partial") return 1
    }

    // Then sort by due date for unpaid/partial
    if ((a.status === "unpaid" || a.status === "partial") && (b.status === "unpaid" || b.status === "partial")) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }

    // Then sort by name
    return a.name.localeCompare(b.name)
  })

  // Count overdue customers
  const overdueCount = customers.filter(
    (c) => (c.status === "unpaid" || c.status === "partial") && new Date(c.dueDate) < new Date(),
  ).length

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-sharp"
        />
      </div>

      <div className="flex justify-between items-center pb-2">
        <div className="flex space-x-2 overflow-x-auto">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-gold text-black hover:bg-gold/90 button-sharp" : "button-sharp"}
          >
            All ({customers.length})
          </Button>
          <Button
            variant={filter === "unpaid" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unpaid")}
            className={filter === "unpaid" ? "bg-gold text-black hover:bg-gold/90 button-sharp" : "button-sharp"}
          >
            Unpaid ({customers.filter((c) => c.status === "unpaid" || c.status === "partial").length})
          </Button>
          <Button
            variant={filter === "overdue" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("overdue")}
            className={filter === "overdue" ? "bg-blood text-white hover:bg-blood/90 button-sharp" : "button-sharp"}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Overdue ({overdueCount})
          </Button>
          <Button
            variant={filter === "paid" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("paid")}
            className={filter === "paid" ? "bg-money text-white hover:bg-money/90 button-sharp" : "button-sharp"}
          >
            Paid ({customers.filter((c) => c.status === "paid").length})
          </Button>
        </div>
        <Button onClick={onAddCustomer} className="bg-gold hover:bg-gold/90 text-black button-sharp">
          <Plus className="h-4 w-4 mr-2" /> ADD CLIENT
        </Button>
      </div>

      {sortedCustomers.length === 0 ? (
        <div className="text-center py-12 bg-smoke">
          <p className="text-muted-foreground">No clients found</p>
          {searchTerm && <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="overflow-hidden card-hover card-sharp border-gold cursor-pointer"
              onClick={() => onSelectCustomer(customer)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium gangster-font">{customer.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Due:{" "}
                      {new Date(customer.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {new Date(customer.dueDate) < new Date() && customer.status !== "paid" && (
                        <span className="ml-1 text-blood font-medium">(Overdue)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {customer.status === "paid" ? (
                      <Badge className="bg-money/20 text-money hover:bg-money/20 border-money/20 rounded-none">
                        PAID
                      </Badge>
                    ) : customer.status === "partial" ? (
                      <Badge className="bg-gold/20 text-gold hover:bg-gold/20 border-gold/20 rounded-none">
                        PARTIAL
                      </Badge>
                    ) : new Date(customer.dueDate) < new Date() ? (
                      <Badge className="bg-blood/20 text-blood hover:bg-blood/20 border-blood/20 rounded-none">
                        OVERDUE
                      </Badge>
                    ) : (
                      <Badge className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/20 border-secondary/20 rounded-none">
                        UPCOMING
                      </Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Amount: {formatCurrency(customer.amountOwed)}</span>
                  {customer.phone && <span className="text-muted-foreground">{customer.phone}</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
