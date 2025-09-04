"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { HustleTip } from "@/components/hustle-tip"
import { HustleStat } from "@/components/hustle-stat"
import { Button } from "@/components/ui/button"
import { ChartContainer } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { DollarSign, TrendingUp, Calendar, AlertTriangle } from "lucide-react"
import type { BusinessData, InventoryItem, Customer, Transaction } from "@/lib/data"
import { useMediaQuery } from "@/hooks/use-mobile"

interface MonthlyForecastProps {
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
  transactions: Transaction[]
  retailPricePerGram: number
  showTips: boolean
  onHideTips: () => void
}

export default function MonthlyForecast({
  businessData,
  inventory,
  customers,
  transactions,
  retailPricePerGram,
  showTips,
  onHideTips,
}: MonthlyForecastProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 768px)")

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Filter transactions for current month
    const monthTransactions =
      transactions?.filter((t) => {
        if (!t.date) return false
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
      }) || []

    // Calculate revenue, profit, and costs
    const revenue = monthTransactions.reduce((sum, t) => {
      if (t.type === "sale" || t.type === "payment") {
        return sum + (t.totalPrice || 0)
      }
      return sum
    }, 0)

    const profit = monthTransactions.reduce((sum, t) => {
      if (t.type === "sale") {
        return sum + (t.profit || 0)
      }
      return sum
    }, 0)

    const costs = monthTransactions.reduce((sum, t) => {
      if (t.type === "purchase") {
        return sum + (t.totalPrice || 0)
      }
      return sum
    }, 0)

    // Calculate sales by product
    const salesByProduct: Record<string, { quantity: number; revenue: number; profit: number }> = {}
    monthTransactions.forEach((t) => {
      if (t.type === "sale" && t.inventoryName) {
        if (!salesByProduct[t.inventoryName]) {
          salesByProduct[t.inventoryName] = { quantity: 0, revenue: 0, profit: 0 }
        }
        salesByProduct[t.inventoryName].quantity += t.quantityGrams || 0
        salesByProduct[t.inventoryName].revenue += t.totalPrice || 0
        salesByProduct[t.inventoryName].profit += t.profit || 0
      }
    })

    // Calculate daily sales data
    const dailySales: Record<string, { date: string; revenue: number; profit: number }> = {}
    monthTransactions.forEach((t) => {
      if (t.type === "sale" || t.type === "payment") {
        const date = t.date.split("T")[0]
        if (!dailySales[date]) {
          dailySales[date] = { date, revenue: 0, profit: 0 }
        }
        dailySales[date].revenue += t.totalPrice
        if (t.type === "sale") {
          dailySales[date].profit += t.profit
        }
      }
    })

    // Sort daily sales by date
    const dailySalesArray = Object.values(dailySales).sort((a, b) => a.date.localeCompare(b.date))

    // For mobile, reduce the number of data points if there are too many
    const optimizedDailySales =
      dailySalesArray.length > 10
        ? dailySalesArray.filter((_, i) => i % Math.ceil(dailySalesArray.length / 10) === 0)
        : dailySalesArray

    // Calculate accounts receivable
    const accountsReceivable = customers.reduce((sum, c) => sum + (c.amountOwed || 0), 0)

    // Calculate inventory value
    const inventoryValue = inventory.reduce((sum, i) => sum + i.quantityOz * i.costPerOz, 0)

    // Calculate inventory retail value
    const inventoryRetailValue = inventory.reduce((sum, i) => {
      const gramsTotal = i.quantityOz * 28.35
      return sum + gramsTotal * retailPricePerGram
    }, 0)

    // Calculate projected monthly profit
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysPassed = Math.min(now.getDate(), daysInMonth)
    const projectedProfit = (profit / daysPassed) * daysInMonth

    // Calculate progress towards target profit
    const targetProfit = businessData.targetProfit
    const profitProgress = targetProfit > 0 ? (profit / targetProfit) * 100 : 0

    return {
      revenue,
      profit,
      costs,
      salesByProduct,
      dailySales: dailySalesArray,
      optimizedDailySales,
      accountsReceivable,
      inventoryValue,
      inventoryRetailValue,
      projectedProfit,
      targetProfit,
      profitProgress,
    }
  }, [transactions, customers, inventory, businessData, retailPricePerGram])

  // Format sales by product for chart
  const salesByProductChart = useMemo(() => {
    const data = Object.entries(monthlyStats.salesByProduct).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      profit: data.profit,
      quantity: data.quantity,
    }))

    // For mobile, limit to top 5 products
    if (isMobile) {
      return data
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((item) => ({
          ...item,
          name: item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name,
        }))
    }

    return data
  }, [monthlyStats.salesByProduct, isMobile])

  // Prepare data for pie chart
  const profitDistributionData = useMemo(() => {
    return [
      { name: "Revenue", value: monthlyStats.revenue },
      { name: "Cost", value: monthlyStats.costs },
      { name: "Profit", value: monthlyStats.profit },
    ]
  }, [monthlyStats.revenue, monthlyStats.costs, monthlyStats.profit])

  // Colors for pie chart
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"]

  // Format date for display on mobile
  const formatDate = (dateStr: string) => {
    if (isMobile) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
    return dateStr
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold graffiti-font text-shadow">MONTHLY FORECAST</h1>
          <p className="text-white/80 mt-1">TRACK YOUR PROGRESS. PLAN YOUR MOVES.</p>
        </div>

        {showTips && (
          <HustleTip title="BUSINESS INTELLIGENCE">
            <p>
              This page shows your monthly performance and projections. Track your progress towards your target profit,
              see which products are selling best, and identify trends in your business.
            </p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={onHideTips}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <HustleStat
          title="MONTHLY REVENUE"
          value={formatCurrency(monthlyStats.revenue)}
          icon={<DollarSign className="h-5 w-5 text-black" />}
        />
        <HustleStat
          title="MONTHLY PROFIT"
          value={formatCurrency(monthlyStats.profit)}
          icon={<TrendingUp className="h-5 w-5 text-black" />}
        />
        <HustleStat
          title="PROJECTED PROFIT"
          value={formatCurrency(monthlyStats.projectedProfit)}
          icon={<Calendar className="h-5 w-5 text-black" />}
        />
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 p-1">
          <TabsTrigger value="overview" className="gangster-font text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            OVERVIEW
          </TabsTrigger>
          <TabsTrigger value="sales" className="gangster-font text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            SALES
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gangster-font text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            INVENTORY
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gangster-font text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            ACCOUNTS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">PROFIT TARGET PROGRESS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    {formatCurrency(monthlyStats.profit)} of {formatCurrency(monthlyStats.targetProfit)}
                  </span>
                  <span className="text-sm font-medium">{formatPercentage(monthlyStats.profitProgress / 100)}</span>
                </div>
                <Progress value={monthlyStats.profitProgress} className="h-2" />
              </div>

              <div className="bg-smoke p-4">
                <h3 className="gangster-font text-gold mb-2">MONTHLY SUMMARY</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">{formatCurrency(monthlyStats.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costs:</span>
                    <span className="font-medium">{formatCurrency(monthlyStats.costs)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit:</span>
                    <span className="font-medium text-money">{formatCurrency(monthlyStats.profit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accounts Receivable:</span>
                    <span className="font-medium">{formatCurrency(monthlyStats.accountsReceivable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory Value:</span>
                    <span className="font-medium">{formatCurrency(monthlyStats.inventoryValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory Retail Value:</span>
                    <span className="font-medium">{formatCurrency(monthlyStats.inventoryRetailValue)}</span>
                  </div>
                </div>
              </div>

              <div className={`${isMobile ? "h-60" : "h-80"}`}>
                <h3 className="gangster-font text-gold mb-2">DAILY REVENUE & PROFIT</h3>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                    profit: {
                      label: "Profit",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className={`${isMobile ? "h-52" : "h-64"}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={isMobile ? monthlyStats.optimizedDailySales : monthlyStats.dailySales}
                      margin={
                        isMobile
                          ? { top: 5, right: 10, left: 0, bottom: 5 }
                          : { top: 20, right: 30, left: 20, bottom: 5 }
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        tickFormatter={formatDate}
                        interval={isMobile ? 1 : 0}
                      />
                      <YAxis
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        width={isMobile ? 40 : 60}
                        tickFormatter={(value) => (isMobile ? `$${value / 1000}k` : `$${value}`)}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                        formatter={(value: any) => [`$${value}`, ""]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                        verticalAlign={isMobile ? "top" : "bottom"}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        name="Revenue"
                        strokeWidth={2}
                        dot={isMobile ? false : { r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="var(--color-profit)"
                        name="Profit"
                        strokeWidth={2}
                        dot={isMobile ? false : { r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {isMobile && (
                <div className="h-60 mt-6">
                  <h3 className="gangster-font text-gold mb-2">PROFIT DISTRIBUTION</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={profitDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {profitDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <LabelList dataKey="name" position="outside" fill="#888" fontSize={10} />
                      </Pie>
                      <Tooltip formatter={(value: any) => [`$${value}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">SALES BY PRODUCT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`${isMobile ? "h-60" : "h-80"}`}>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                    profit: {
                      label: "Profit",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className={`${isMobile ? "h-52" : "h-64"}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesByProductChart}
                      margin={
                        isMobile
                          ? { top: 5, right: 10, left: 0, bottom: 5 }
                          : { top: 20, right: 30, left: 20, bottom: 5 }
                      }
                      layout={isMobile ? "vertical" : "horizontal"}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      {isMobile ? (
                        <>
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                          <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(value) => `$${value / 1000}k`} />
                        </>
                      ) : (
                        <>
                          <XAxis dataKey="name" />
                          <YAxis />
                        </>
                      )}
                      <Tooltip
                        contentStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                        formatter={(value: any) => [`$${value}`, ""]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                        verticalAlign={isMobile ? "top" : "bottom"}
                      />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" name="Revenue" barSize={isMobile ? 15 : 20} />
                      <Bar dataKey="profit" fill="var(--color-profit)" name="Profit" barSize={isMobile ? 15 : 20} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="space-y-4 mt-4">
                <h3 className="gangster-font text-gold">TOP PRODUCTS</h3>
                <div className="space-y-2">
                  {salesByProductChart
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, isMobile ? 3 : 5)
                    .map((product, index) => (
                      <div key={index} className="bg-smoke p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(product.quantity || 0).toFixed(1)}g sold
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(product.revenue || 0)}</div>
                          <div className="text-xs text-money">{formatCurrency(product.profit || 0)} profit</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">INVENTORY STATUS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-smoke p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="gangster-font">INVENTORY VALUE</h3>
                    <span className="font-medium">{formatCurrency(monthlyStats.inventoryValue)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <h3 className="gangster-font">RETAIL VALUE</h3>
                    <span className="font-medium">{formatCurrency(monthlyStats.inventoryRetailValue)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <h3 className="gangster-font">POTENTIAL PROFIT</h3>
                    <span className="font-medium text-money">
                      {formatCurrency(monthlyStats.inventoryRetailValue - monthlyStats.inventoryValue)}
                    </span>
                  </div>
                </div>

                <h3 className="gangster-font text-gold">INVENTORY LEVELS</h3>
                <div className="space-y-2">
                  {inventory.slice(0, isMobile ? 5 : inventory.length).map((item) => {
                    const percentRemaining = item.initialQuantityOz
                      ? (item.quantityOz / item.initialQuantityOz) * 100
                      : 0
                    let statusColor = "bg-green-500"
                    if (percentRemaining < 25) statusColor = "bg-red-500"
                    else if (percentRemaining < 50) statusColor = "bg-yellow-500"

                    return (
                      <div key={item.id} className="bg-smoke p-3">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{item.name}</div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                            <span>{(item.quantityOz || 0).toFixed(2)} oz</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress value={percentRemaining} className="h-1" />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            {formatPercentage(percentRemaining / 100)} of {(item.initialQuantityOz || 0).toFixed(2)} oz
                          </span>
                          <span>{formatCurrency((item.quantityOz || 0) * (item.costPerOz || 0))}</span>
                        </div>
                      </div>
                    )
                  })}

                  {isMobile && inventory.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground pt-2">
                      + {inventory.length - 5} more items
                    </div>
                  )}
                </div>

                {inventory.some(
                  (item) => item.initialQuantityOz && (item.quantityOz / item.initialQuantityOz) * 100 < 25,
                ) && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-500">Low Inventory Alert</h4>
                      <p className="text-sm mt-1">
                        Some products are running low. Consider restocking soon to avoid running out.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6 mt-6">
          <Card className="card-sharp border-gold">
            <CardHeader>
              <CardTitle className="gangster-font text-gold">ACCOUNTS RECEIVABLE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-smoke p-4">
                <div className="flex justify-between items-center">
                  <h3 className="gangster-font">TOTAL OWED</h3>
                  <span className="font-medium">{formatCurrency(monthlyStats.accountsReceivable)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <h3 className="gangster-font">CLIENTS WITH DEBT</h3>
                  <span className="font-medium">{customers.filter((c) => (c.amountOwed || 0) > 0).length}</span>
                </div>
              </div>

              <h3 className="gangster-font text-gold">OUTSTANDING BALANCES</h3>
              <div className="space-y-2">
                {customers
                  .filter((c) => (c.amountOwed || 0) > 0)
                  .sort((a, b) => (b.amountOwed || 0) - (a.amountOwed || 0))
                  .slice(0, isMobile ? 5 : customers.length)
                  .map((customer) => {
                    const dueDate = new Date(customer.dueDate || Date.now())
                    const now = new Date()
                    const isOverdue = dueDate < now

                    return (
                      <div key={customer.id} className="bg-smoke p-3">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{customer.name}</div>
                          <div className={`font-medium ${isOverdue ? "text-red-500" : ""}`}>
                            {formatCurrency(customer.amountOwed || 0)}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Due: {dueDate.toLocaleDateString()}</span>
                          <span className={isOverdue ? "text-red-500" : ""}>
                            {isOverdue
                              ? "OVERDUE"
                              : "Due in " +
                                Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) +
                                " days"}
                          </span>
                        </div>
                      </div>
                    )
                  })}

                {isMobile && customers.filter((c) => (c.amountOwed || 0) > 0).length > 5 && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    + {customers.filter((c) => (c.amountOwed || 0) > 0).length - 5} more clients
                  </div>
                )}

                {customers.filter((c) => (c.amountOwed || 0) > 0).length === 0 && (
                  <div className="bg-smoke p-6 text-center">
                    <p className="text-money gangster-font">NO OUTSTANDING BALANCES</p>
                    <p className="text-sm text-muted-foreground mt-1">All clients are paid up. Good work!</p>
                  </div>
                )}
              </div>

              {customers.some((c) => (c.amountOwed || 0) > 0 && new Date(c.dueDate || Date.now()) < new Date()) && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-500">Overdue Payments</h4>
                    <p className="text-sm mt-1">
                      Some clients have overdue payments. Follow up with them to collect what's owed.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
