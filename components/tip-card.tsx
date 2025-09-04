import type React from "react"
import { Lightbulb } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TipCardProps {
  title: string
  children: React.ReactNode
}

export function TipCard({ title, children }: TipCardProps) {
  return (
    <Card className="border-l-4 border-l-amber-500 bg-amber-500/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-amber-500 rounded-full p-1.5 mt-0.5">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-amber-500">{title}</h4>
            <div className="text-sm mt-1 text-muted-foreground">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
