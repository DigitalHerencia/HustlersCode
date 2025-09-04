import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface HustleStatProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
}

export function HustleStat({ title, value, icon, trend, trendValue, className }: HustleStatProps) {
  return (
    <Card className={cn("overflow-hidden card-sharp border-gold", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground gangster-font">{title}</p>
            <h3 className="text-2xl font-bold mt-1 gold-text gangster-font">{value}</h3>
            {trend && trendValue && (
              <p
                className={cn(
                  "text-xs mt-1",
                  trend === "up" && "money-text",
                  trend === "down" && "danger-text",
                  trend === "neutral" && "text-muted-foreground",
                )}
              >
                {trend === "up" && "↑ "}
                {trend === "down" && "↓ "}
                {trendValue}
              </p>
            )}
          </div>
          <div className="bg-gold p-2">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
