import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface HustleTipProps {
  title: string
  children: React.ReactNode
}

export function HustleTip({ title, children }: HustleTipProps) {
  return (
    <Card className="bg-smoke card-sharp">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center text-center">
          <h4 className="font-medium text-gold gangster-font">{title}</h4>
          <div className="text-sm mt-1 text-muted-foreground">{children}</div>
        </div>
      </CardContent>
    </Card>
  )
}
