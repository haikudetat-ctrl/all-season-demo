import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Tone = "lime" | "green" | "gold" | "red" | "navy" | "muted"

const toneText: Record<Tone, string> = {
  lime: "text-primary",
  green: "text-green",
  gold: "text-solar",
  red: "text-red",
  navy: "text-navy",
  muted: "text-muted-foreground",
}

const toneBadge: Record<Tone, string> = {
  lime: "border-primary/20 bg-primary/15 text-navy",
  green: "border-green/20 bg-green-light text-green",
  gold: "border-solar/25 bg-yellow-light text-yellow",
  red: "border-red/20 bg-red-light text-red",
  navy: "border-navy/15 bg-navy-lighter text-navy",
  muted: "border-border bg-muted text-muted-foreground",
}

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-solar">
        Loading...
      </div>
    </div>
  )
}

export function DashboardCard({
  className,
  children,
  size,
}: {
  className?: string
  children: ReactNode
  size?: "default" | "sm"
}) {
  return (
    <Card
      size={size}
      className={cn(
        "border border-border/70 bg-card/95 shadow-solar ring-primary/10",
        className
      )}
    >
      {children}
    </Card>
  )
}

export function DashboardCardTitle({
  children,
  action,
  className,
}: {
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <CardHeader className={cn("border-b border-border/70 pb-3", className)}>
      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-navy">
        {children}
      </CardTitle>
      {action ? <div className="text-xs text-muted-foreground">{action}</div> : null}
    </CardHeader>
  )
}

export function DashboardCardContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <CardContent className={className}>{children}</CardContent>
}

export function MetricCard({
  label,
  value,
  tone = "navy",
}: {
  label: string
  value: string | number
  tone?: Tone
}) {
  return (
    <DashboardCard size="sm" className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-lime" />
      <CardContent className="pt-1">
        <div className={cn("text-2xl font-bold leading-none", toneText[tone])}>
          {value}
        </div>
        <div className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      </CardContent>
    </DashboardCard>
  )
}

export function SolarBadge({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md font-semibold", toneBadge[tone], className)}
    >
      {children}
    </Badge>
  )
}

export function DetailField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      <span className="mt-0.5 block text-sm text-foreground">{children}</span>
    </div>
  )
}
