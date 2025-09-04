"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, DollarSign, Phone, Mail, MapPin, Clock, FileText } from "lucide-react"
import type { Customer } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"

interface CustomerDetailsProps {
  customer: Customer
  onEdit: () => void
  onDelete: () => void
  onAddPayment: () => void
}

export default function CustomerDetails({ customer, onEdit, onDelete, onAddPayment }: CustomerDetailsProps) {
  // Calculate days overdue
  const daysOverdue = () => {
    if (customer.status === "paid") return 0

    const dueDate = new Date(customer.dueDate)
    const today = new Date()
    const diffTime = today.getTime() - dueDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Calculate total paid
  const totalPaid = customer.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0)

  // Calculate original amount (current amount owed + all payments)
  const originalAmount = customer.amountOwed + totalPaid

  // Calculate payment percentage
  const paymentPercentage = originalAmount > 0 ? (totalPaid / originalAmount) * 100 : 0

  return (
    <Card className="card-sharp border-gold">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold gangster-font text-gold">{customer.name}</h2>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Client since {new Date(customer.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            {customer.status === "paid" ? (
              <Badge className="bg-money/20 text-money hover:bg-money/20 border-money/20 rounded-none">PAID</Badge>
            ) : customer.status === "partial" ? (
              <Badge className="bg-gold/20 text-gold hover:bg-gold/20 border-gold/20 rounded-none">PARTIAL</Badge>
            ) : daysOverdue() > 0 ? (
              <Badge className="bg-blood/20 text-blood hover:bg-blood/20 border-blood/20 rounded-none">
                {daysOverdue()} DAYS OVERDUE
              </Badge>
            ) : (
              <Badge className="bg-secondary/50 hover:bg-secondary/50 rounded-none">
                DUE {new Date(customer.dueDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-smoke p-4">
            <div className="text-sm text-muted-foreground gangster-font">AMOUNT OWED</div>
            <div className="text-xl font-bold mt-1 gold-text gangster-font">{formatCurrency(customer.amountOwed)}</div>
          </div>
          <div className="bg-smoke p-4">
            <div className="text-sm text-muted-foreground gangster-font">TOTAL PAID</div>
            <div className="text-xl font-bold mt-1 money-text gangster-font">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="bg-smoke p-4">
            <div className="text-sm text-muted-foreground gangster-font">ORIGINAL AMOUNT</div>
            <div className="text-xl font-bold mt-1 gangster-font">{formatCurrency(originalAmount)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold gangster-font text-gold">CONTACT INFO</h3>

            {customer.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}

            {customer.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}

            {customer.address && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{customer.address}</span>
              </div>
            )}

            {customer.notes && (
              <div className="flex items-start mt-4">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                <div>
                  <div className="text-sm font-medium">Notes:</div>
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold gangster-font text-gold mb-3">PAYMENT PROGRESS</h3>
            <div className="w-full bg-secondary h-4">
              <div className="bg-gold h-4" style={{ width: `${paymentPercentage}%` }}></div>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>{paymentPercentage.toFixed(0)}% Paid</span>
              <span>{(100 - paymentPercentage).toFixed(0)}% Remaining</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold gangster-font text-gold">PAYMENT HISTORY</h3>
            <Button
              onClick={onAddPayment}
              disabled={customer.status === "paid"}
              className="bg-gold hover:bg-gold/90 text-black button-sharp"
            >
              <DollarSign className="h-4 w-4 mr-2" /> COLLECT PAYMENT
            </Button>
          </div>

          {customer.paymentHistory.length === 0 ? (
            <div className="text-center py-6 bg-smoke">
              <p className="text-muted-foreground">No payment history available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="gangster-font">DATE</TableHead>
                  <TableHead className="gangster-font">AMOUNT</TableHead>
                  <TableHead className="gangster-font">METHOD</TableHead>
                  <TableHead className="gangster-font">NOTES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium text-money">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="capitalize">{payment.method.replace("_", " ")}</TableCell>
                    <TableCell>{payment.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={onEdit} className="border-gold/20 text-gold hover:bg-gold/10 button-sharp">
            <Edit className="h-4 w-4 mr-2" /> EDIT CLIENT
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            className="border-blood/20 text-blood hover:bg-blood/10 button-sharp"
          >
            <Trash2 className="h-4 w-4 mr-2" /> DELETE CLIENT
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
