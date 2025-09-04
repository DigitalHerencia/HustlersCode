"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ScenarioData } from "@/lib/data"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useMediaQuery } from "@/hooks/use-mobile"

interface RetailAnalyticsChartsProps {
  scenarios: ScenarioData[]
}

export default function RetailAnalyticsCharts({ scenarios }: RetailAnalyticsChartsProps) {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 768px)")

  const chartData = useMemo(() => {
    return scenarios.map((s) => ({
      name: s.scenario,
      retailPrice: s.retailPriceG,
      grossMargin: s.grossMarginG,
      quantityMonth: s.qtyMonthG,
      revenue: s.monthlyRevenue,
      cost: s.monthlyCost,
      profit: s.netProfit,
      commission: s.totalCommission,
      netProfitAfterCommission: s.netProfitAfterCommission,
    }))
  }, [scenarios])

  const profitMarginData = useMemo(() => {
    return scenarios.map((s) => ({
      name: s.scenario,
      profitMargin: (s.grossMarginG / s.retailPriceG) * 100,
    }))
  }, [scenarios])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Price vs. Quantity</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "h-60" : "h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={
                isMobile ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} interval={isMobile ? 1 : 0} />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#8884d8"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 40 : 60}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#82ca9d"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 40 : 60}
              />
              <Tooltip contentStyle={{ fontSize: isMobile ? "10px" : "12px" }} />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                verticalAlign={isMobile ? "top" : "bottom"}
              />
              <Bar
                yAxisId="left"
                dataKey="retailPrice"
                name="Retail Price ($/g)"
                fill="#8884d8"
                barSize={isMobile ? 15 : 20}
              />
              <Bar
                yAxisId="right"
                dataKey="quantityMonth"
                name="Monthly Quantity (g)"
                fill="#82ca9d"
                barSize={isMobile ? 15 : 20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue, Cost & Profit</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "h-60" : "h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={
                isMobile ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} interval={isMobile ? 1 : 0} />
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
              <Bar dataKey="revenue" name="Monthly Revenue" stackId="a" fill="#8884d8" barSize={isMobile ? 15 : 20} />
              <Bar dataKey="cost" name="Monthly Cost" stackId="a" fill="#82ca9d" barSize={isMobile ? 15 : 20} />
              <Bar
                dataKey="commission"
                name="Sales Commission"
                stackId="a"
                fill="#ff8042"
                barSize={isMobile ? 15 : 20}
              />
              <Bar
                dataKey="netProfitAfterCommission"
                name="Net Profit (After Commission)"
                fill="#ffc658"
                barSize={isMobile ? 15 : 20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit Margin Percentage</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "h-60" : "h-80"}>
          <ChartContainer
            config={{
              profitMargin: {
                label: "Profit Margin %",
                color: "hsl(var(--chart-1))",
              },
            }}
            className={isMobile ? "h-52" : "h-64"}
          >
            <LineChart
              data={profitMarginData}
              margin={
                isMobile ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} interval={isMobile ? 1 : 0} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 40 : 60} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="profitMargin"
                stroke="var(--color-profitMargin)"
                strokeWidth={2}
                activeDot={{ r: isMobile ? 4 : 8 }}
                dot={isMobile ? false : { r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Impact on Profit</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "h-60" : "h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={
                isMobile ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} interval={isMobile ? 1 : 0} />
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
              <Bar dataKey="profit" name="Gross Profit" fill="#8884d8" barSize={isMobile ? 15 : 20} />
              <Bar dataKey="commission" name="Sales Commission" fill="#ff8042" barSize={isMobile ? 15 : 20} />
              <Bar dataKey="netProfitAfterCommission" name="Net Profit" fill="#82ca9d" barSize={isMobile ? 15 : 20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
