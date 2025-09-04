"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown } from "lucide-react"
import type { PricePoint } from "@/lib/data"
import { formatCurrency, formatGrams } from "@/lib/utils"

interface PriceTableProps {
  pricePoints: PricePoint[]
  onSelectPricePoint: (id: string) => void
  selectedPricePointId: string
}

type SortKey = keyof PricePoint
type SortOrder = "asc" | "desc"

export default function PriceTable({ pricePoints, onSelectPricePoint, selectedPricePointId }: PriceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("markupPercentage")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  // Ensure pricePoints is an array before sorting
  const validPricePoints = Array.isArray(pricePoints) ? pricePoints : []

  const sortedData = useMemo(() => {
    return [...validPricePoints].sort((a, b) => {
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
  }, [validPricePoints, sortKey, sortOrder])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  // Highlight the middle row (median price point)
  const middleIndex = Math.floor(validPricePoints.length / 2)
  const isMiddleRow = (index: number) => index === middleIndex

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("markupPercentage")}>
              <div className="flex items-center">
                Markup %
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("retailPricePerGram")}>
              <div className="flex items-center">
                Retail (per g)
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("profitPerGram")}>
              <div className="flex items-center">
                Profit (per g)
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("breakEvenGramsPerMonth")}
            >
              <div className="flex items-center">
                Break-even (g)
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("monthlyRevenue")}>
              <div className="flex items-center">
                Monthly revenue
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("monthlyProfit")}>
              <div className="flex items-center">
                Monthly profit
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("roi")}>
              <div className="flex items-center">
                ROI %
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No price points found. Please calculate prices first.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, index) => (
              <TableRow
                key={row.id}
                className={`${row.id === selectedPricePointId ? "bg-muted/50" : ""} 
                           ${isMiddleRow(index) ? "font-medium border-l-4 border-gold" : ""}`}
                onClick={() => onSelectPricePoint(row.id)}
              >
                <TableCell>{row.markupPercentage}%</TableCell>
                <TableCell>{formatCurrency(row.retailPricePerGram)}</TableCell>
                <TableCell>{formatCurrency(row.profitPerGram)}</TableCell>
                <TableCell>{formatGrams(row.breakEvenGramsPerMonth)}</TableCell>
                <TableCell>{formatCurrency(row.monthlyRevenue)}</TableCell>
                <TableCell>{formatCurrency(row.monthlyProfit)}</TableCell>
                <TableCell>{row.roi.toFixed(1)}%</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
