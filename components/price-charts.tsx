"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PricePoint } from "@/lib/data"
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
import { useMediaQuery } from "@/hooks/use-mobile"

interface PriceChartsProps {
  pricePoints: PricePoint[]
}

export default function PriceCharts({ pricePoints }: PriceChartsProps) {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 768px)")

  const chartData = useMemo(() => {
    // For mobile, limit the number of data points
    const filteredPoints =
      isMobile && pricePoints.length > 5
        ? pricePoints.filter((_, i) => i % Math.ceil(pricePoints.length / 5) === 0)
        : pricePoints

    return filteredPoints.map((p) => ({
      name: `${p.markupPercentage}%`,
      retailPrice: p.retailPriceG,
      wholesalePrice: p.wholesalePriceG,
      margin: p.grossMarginG,
      quantity: p.qtyMonthG,
      revenue: p.monthlyRevenue,
      cost: p.monthlyCost,
      profit: p.netProfit,
    }))
  }, [pricePoints, isMobile])

  // Highlight the middle data point (median price)
  const middleIndex = Math.floor(pricePoints.length / 2)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "h-60" : "h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={
                isMobile ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }
              }
              layout={isMobile ? "vertical" : "horizontal"}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {isMobile ? (
                <>
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={40} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" />
                  <YAxis />
                </>
              )}
              <Tooltip contentStyle={{ fontSize: isMobile ? "10px" : "12px" }} />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                verticalAlign={isMobile ? "top" : "bottom"}
              />
              <Bar
                dataKey="wholesalePrice"
                name="Wholesale Price ($/g)"
                stackId="a"
                fill="#82ca9d"
                barSize={isMobile ? 15 : 20}
              />
              <Bar dataKey="margin" name="Margin ($/g)" stackId="a" fill="#8884d8" barSize={isMobile ? 15 : 20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price vs. Quantity</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "h-60" : "h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 40 : 60}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 40 : 60}
              />
              <Tooltip contentStyle={{ fontSize: isMobile ? "10px" : "12px" }} />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                verticalAlign={isMobile ? "top" : "bottom"}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="retailPrice"
                name="Retail Price ($/g)"
                stroke="#8884d8"
                activeDot={{ r: isMobile ? 4 : 8 }}
                strokeWidth={2}
                dot={isMobile ? false : { r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="quantity"
                name="Monthly Quantity (g)"
                stroke="#82ca9d"
                activeDot={{ r: isMobile ? 4 : 8 }}
                strokeWidth={2}
                dot={isMobile ? false : { r: 3 }}
              />
            </LineChart>
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
              <Bar dataKey="revenue" name="Monthly Revenue" fill="#8884d8" barSize={isMobile ? 15 : 20} />
              <Bar dataKey="cost" name="Monthly Cost" fill="#82ca9d" barSize={isMobile ? 15 : 20} />
              <Bar dataKey="profit" name="Net Profit" fill="#ffc658" barSize={isMobile ? 15 : 20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit Margin Percentage</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "h-60" : "h-80"}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={
                isMobile ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} interval={isMobile ? 1 : 0} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 40 : 60} />
              <Tooltip
                contentStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, "Profit Margin"]}
              />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                verticalAlign={isMobile ? "top" : "bottom"}
              />
              <Line
                type="monotone"
                dataKey={(data) => data.margin / data.retailPrice}
                name="Profit Margin %"
                stroke="#ff7300"
                activeDot={{ r: isMobile ? 4 : 8 }}
                strokeWidth={2}
                dot={isMobile ? false : { r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
