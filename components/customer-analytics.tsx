"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Users, AlertTriangle, Clock } from "lucide-react"
import type { Customer } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import { HustleStat } from "@/components/hustle-stat"

interface CustomerAnalyticsProps {
  customers: Customer[]
}

export default function CustomerAnalytics({ customers }: CustomerAnalyticsProps) {
  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalReceivables = customers.reduce((sum, c) => sum + c.amountOwed, 0)

    const overdueCustomers = customers.filter(
      (c) => (c.status === "unpaid" || c.status === "partial") && new Date(c.dueDate) < new Date(),
    )

    const overdueAmount = overdueCustomers.reduce((sum, c) => sum + c.amountOwed, 0)

    const paidCustomers = customers.filter((c) => c.status === "paid")
    const partialCustomers = customers.filter((c) => c.status === "partial")
    const unpaidCustomers = customers.filter((c) => c.status === "unpaid")

    // Calculate collection rate
    const totalPaid = customers.reduce((sum, c) => sum + c.paymentHistory.reduce((pSum, p) => pSum + p.amount, 0), 0)

    const totalBilled = totalReceivables + totalPaid
    const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0

    // Calculate average days to pay
    const paymentDays = customers.flatMap((c) =>
      c.paymentHistory.map((p) => {
        const paymentDate = new Date(p.date)
        const dueDate = new Date(c.dueDate)
        const diffTime = paymentDate.getTime() - dueDate.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }),
    )

    const avgDaysToPay =
      paymentDays.length > 0 ? paymentDays.reduce((sum, days) => sum + days, 0) / paymentDays.length : 0

    return {
      totalReceivables,
      overdueCustomers: overdueCustomers.length,
      overdueAmount,
      paidCustomers: paidCustomers.length,
      partialCustomers: partialCustomers.length,
      unpaidCustomers: unpaidCustomers.length,
      collectionRate,
      avgDaysToPay,
    }
  }, [customers])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gangster-font text-gold">MONEY COLLECTION STATS</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HustleStat
          title="TOTAL RECEIVABLES"
          value={formatCurrency(metrics.totalReceivables)}
          icon={<DollarSign className="h-5 w-5 text-black" />}
        />
        <HustleStat
          title="OVERDUE AMOUNT"
          value={formatCurrency(metrics.overdueAmount)}
          icon={<AlertTriangle className="h-5 w-5 text-black" />}
          trend={metrics.overdueAmount > 0 ? "down" : "neutral"}
          trendValue={metrics.overdueAmount > 0 ? "Needs collection" : "All paid on time"}
        />
        <HustleStat
          title="TOTAL CLIENTS"
          value={customers.length.toString()}
          icon={<Users className="h-5 w-5 text-black" />}
        />
        <HustleStat
          title="COLLECTION RATE"
          value={`${metrics.collectionRate.toFixed(1)}%`}
          icon={<Clock className="h-5 w-5 text-black" />}
          trend={metrics.collectionRate > 80 ? "up" : metrics.collectionRate > 50 ? "neutral" : "down"}
          trendValue={metrics.collectionRate > 80 ? "Excellent" : metrics.collectionRate > 50 ? "Average" : "Poor"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-sharp border-gold">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold gangster-font text-gold mb-4">CLIENT PAYMENT STATUS</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="gangster-font">PAID CLIENTS</span>
                  <span className="text-money">
                    {metrics.paidCustomers} / {customers.length}
                  </span>
                </div>
                <Progress
                  value={(metrics.paidCustomers / Math.max(1, customers.length)) * 100}
                  className="h-2 border-sharp"
                  indicatorClassName="bg-money"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="gangster-font">PARTIAL PAYMENT</span>
                  <span className="text-gold">
                    {metrics.partialCustomers} / {customers.length}
                  </span>
                </div>
                <Progress
                  value={(metrics.partialCustomers / Math.max(1, customers.length)) * 100}
                  className="h-2 border-sharp"
                  indicatorClassName="bg-gold"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="gangster-font">UNPAID CLIENTS</span>
                  <span className="text-muted-foreground">
                    {metrics.unpaidCustomers} / {customers.length}
                  </span>
                </div>
                <Progress
                  value={(metrics.unpaidCustomers / Math.max(1, customers.length)) * 100}
                  className="h-2 border-sharp"
                  indicatorClassName="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="gangster-font">OVERDUE CLIENTS</span>
                  <span className="text-blood">
                    {metrics.overdueCustomers} / {customers.length}
                  </span>
                </div>
                <Progress
                  value={(metrics.overdueCustomers / Math.max(1, customers.length)) * 100}
                  className="h-2 border-sharp"
                  indicatorClassName="bg-blood"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sharp border-gold">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold gangster-font text-gold mb-4">COLLECTION METRICS</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="gangster-font">COLLECTION RATE</span>
                  <span
                    className={
                      metrics.collectionRate > 80
                        ? "text-money"
                        : metrics.collectionRate > 50
                          ? "text-gold"
                          : "text-blood"
                    }
                  >
                    {metrics.collectionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary h-4">
                  <div
                    className={`h-4 ${metrics.collectionRate > 80 ? "bg-money" : metrics.collectionRate > 50 ? "bg-gold" : "bg-blood"}`}
                    style={{ width: `${Math.min(100, metrics.collectionRate)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="bg-smoke p-4">
                <div className="text-sm text-muted-foreground gangster-font">AVERAGE DAYS TO PAY</div>
                <div className="text-xl font-bold mt-1 gangster-font">
                  {Math.abs(metrics.avgDaysToPay).toFixed(1)} days
                  {metrics.avgDaysToPay < 0 ? " before due date" : " after due date"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {metrics.avgDaysToPay < 0
                    ? "Your clients pay early - excellent!"
                    : metrics.avgDaysToPay === 0
                      ? "Your clients pay on time"
                      : metrics.avgDaysToPay < 7
                        ? "Acceptable payment timing"
                        : "Clients are paying too late"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
