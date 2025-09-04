"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ArrowUpDown } from "lucide-react"
import type { ScenarioData } from "@/lib/data"
import { formatCurrency, formatGrams, formatOunces } from "@/lib/utils"

interface RetailAnalyticsTableProps {
  scenarios: ScenarioData[]
  onEdit: (scenario: ScenarioData) => void
  onDelete: (id: string) => void
  onSelectScenario: (id: string) => void
  selectedScenarioId: string
}

type SortKey = keyof ScenarioData
type SortOrder = "asc" | "desc"

export default function RetailAnalyticsTable({
  scenarios,
  onEdit,
  onDelete,
  onSelectScenario,
  selectedScenarioId,
}: RetailAnalyticsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("retailPriceG")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const sortedData = useMemo(() => {
    return [...scenarios].sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]

      if (valA < valB) {
        return sortOrder === "asc" ? -1 : 1
      }
      if (valA > valB) {
        return sortOrder === "asc" ? 1 : -1
      }
      return 0
    })
  }, [scenarios, sortKey, sortOrder])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("scenario")}>
              <div className="flex items-center">
                Scenario
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("retailPriceG")}>
              <div className="flex items-center">
                Retail price (per g)
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("grossMarginG")}>
              <div className="flex items-center">
                Gross margin (per g)
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("qtyMonthG")}>
              <div className="flex items-center">
                Qty/month (g)
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("qtyMonthOz")}>
              <div className="flex items-center">
                Qty/month (oz)
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("monthlyRevenue")}>
              <div className="flex items-center">
                Monthly revenue
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("monthlyCost")}>
              <div className="flex items-center">
                Monthly cost
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("totalCommission")}>
              <div className="flex items-center">
                Total commission
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("netProfitAfterCommission")}
            >
              <div className="flex items-center">
                Net profit (after commission)
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center">
                No scenarios found. Add a new scenario to get started.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row) => (
              <TableRow
                key={row.id}
                className={row.id === selectedScenarioId ? "bg-muted/50" : ""}
                onClick={() => onSelectScenario(row.id)}
              >
                <TableCell>{row.scenario}</TableCell>
                <TableCell>{formatCurrency(row.retailPriceG)}</TableCell>
                <TableCell>{formatCurrency(row.grossMarginG)}</TableCell>
                <TableCell>{formatGrams(row.qtyMonthG)}</TableCell>
                <TableCell>{formatOunces(row.qtyMonthOz)}</TableCell>
                <TableCell>{formatCurrency(row.monthlyRevenue)}</TableCell>
                <TableCell>{formatCurrency(row.monthlyCost)}</TableCell>
                <TableCell>{formatCurrency(row.totalCommission)}</TableCell>
                <TableCell>{formatCurrency(row.netProfitAfterCommission)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(row)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(row.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
