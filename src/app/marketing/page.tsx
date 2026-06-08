'use client'

import { Fragment, useState } from 'react'
import { useAppData } from '@/lib/store'
import Header from '@/components/header'
import SettingsDialog from '@/components/settings-dialog'
import type { LeadSource } from '@/lib/types'
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardTitle,
  LoadingState,
  MetricCard,
  SolarBadge,
} from '@/components/dashboard-ui'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US')
}

const SOURCES: LeadSource[] = ['Meta', 'Google Ads', 'Organic', 'Referral', 'Door Knocking', 'Home Shows', 'Website']

export default function MarketingPage() {
  const { data, loaded, updateProfile } = useAppData()
  const [drillDown, setDrillDown] = useState<LeadSource | null>(null)

  if (!loaded || !data) {
    return <LoadingState />
  }

  const marketing = data.marketing
  const months = [...new Set(marketing.map(m => m.month))].sort()

  const aggregated = SOURCES.map(source => {
    const rows = marketing.filter(m => m.source === source)
    const totalSpend = rows.reduce((s, r) => s + r.spend, 0)
    const totalLeads = rows.reduce((s, r) => s + r.leads, 0)
    const totalAppts = rows.reduce((s, r) => s + r.appointments, 0)
    const totalSales = rows.reduce((s, r) => s + r.sales, 0)
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
    return {
      source,
      spend: totalSpend,
      leads: totalLeads,
      appointments: totalAppts,
      sales: totalSales,
      revenue: totalRevenue,
      costPerLead: totalLeads > 0 ? totalSpend / totalLeads : 0,
      costPerAppt: totalAppts > 0 ? totalSpend / totalAppts : 0,
      costPerSale: totalSales > 0 ? totalSpend / totalSales : 0,
      roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100) : 0,
    }
  })

  const totals = {
    spend: aggregated.reduce((s, r) => s + r.spend, 0),
    leads: aggregated.reduce((s, r) => s + r.leads, 0),
    appointments: aggregated.reduce((s, r) => s + r.appointments, 0),
    sales: aggregated.reduce((s, r) => s + r.sales, 0),
    revenue: aggregated.reduce((s, r) => s + r.revenue, 0),
  }

  const maxSpend = Math.max(...aggregated.map(r => r.spend), 1)

  function toggleDrillDown(source: LeadSource) {
    setDrillDown(drillDown === source ? null : source)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        profile={data.profile}
        settingsButton={<SettingsDialog profile={data.profile} onSave={updateProfile} />}
      />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-5">
          <MetricCard label="Total Spend" value={formatCurrency(totals.spend)} tone="lime" />
          <MetricCard label="Total Leads" value={totals.leads} tone="navy" />
          <MetricCard label="Total Sales" value={totals.sales} tone="green" />
          <MetricCard label="Total Revenue" value={formatCurrency(totals.revenue)} tone="green" />
          <MetricCard label="Avg Cost Per Sale" value={formatCurrency(Math.round(totals.spend / Math.max(totals.sales, 1)))} tone="gold" />
        </div>

        <DashboardCard className="mb-6">
          <DashboardCardTitle>Source Performance</DashboardCardTitle>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/70 hover:bg-muted/70">
                <TableHead className="w-8 px-4 text-xs uppercase tracking-wide text-muted-foreground" />
                <TableHead className="px-4 text-xs uppercase tracking-wide text-muted-foreground">Source</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Spend</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Leads</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Appts</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Sales</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Revenue</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Cost/Lead</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Cost/Sale</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aggregated.map(row => {
                const barWidth = (row.spend / maxSpend) * 100
                const isOpen = drillDown === row.source
                return (
                  <Fragment key={row.source}>
                    <TableRow
                      className={`cursor-pointer ${isOpen ? 'bg-primary/10 hover:bg-primary/10' : ''}`}
                      onClick={() => toggleDrillDown(row.source)}
                    >
                      <TableCell className="px-4">
                        <span className={`inline-block text-xs text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`}>▸</span>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground">{row.source}</span>
                          <div className="hidden h-2 w-24 overflow-hidden rounded-md bg-muted md:block">
                            <div className="h-full rounded-md bg-gradient-lime" style={{ width: `${barWidth}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-right font-medium text-foreground">{formatCurrency(row.spend)}</TableCell>
                      <TableCell className="px-4 text-right text-muted-foreground">{row.leads}</TableCell>
                      <TableCell className="px-4 text-right text-muted-foreground">{row.appointments}</TableCell>
                      <TableCell className="px-4 text-right text-muted-foreground">{row.sales}</TableCell>
                      <TableCell className="px-4 text-right font-medium text-green">{formatCurrency(row.revenue)}</TableCell>
                      <TableCell className="px-4 text-right text-muted-foreground">{formatCurrency(Math.round(row.costPerLead))}</TableCell>
                      <TableCell className="px-4 text-right text-muted-foreground">{formatCurrency(Math.round(row.costPerSale))}</TableCell>
                      <TableCell className="px-4 text-right">
                        <SolarBadge tone={row.roi > 0 ? 'green' : 'red'}>
                          {row.roi > 0 ? '+' : ''}{Math.round(row.roi)}%
                        </SolarBadge>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow key={`${row.source}-drill`} className="hover:bg-transparent">
                        <TableCell colSpan={10} className="px-4 pb-4 pt-0">
                          <SourceDrillDown source={row.source} months={months} marketing={marketing} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="border-t-2 border-primary bg-muted/80 hover:bg-muted/80">
                <TableCell className="px-4" />
                <TableCell className="px-4 text-foreground">Totals</TableCell>
                <TableCell className="px-4 text-right text-foreground">{formatCurrency(totals.spend)}</TableCell>
                <TableCell className="px-4 text-right text-foreground">{totals.leads}</TableCell>
                <TableCell className="px-4 text-right text-foreground">{totals.appointments}</TableCell>
                <TableCell className="px-4 text-right text-foreground">{totals.sales}</TableCell>
                <TableCell className="px-4 text-right font-bold text-green">{formatCurrency(totals.revenue)}</TableCell>
                <TableCell className="px-4 text-right text-foreground">{formatCurrency(Math.round(totals.spend / Math.max(totals.leads, 1)))}</TableCell>
                <TableCell className="px-4 text-right text-foreground">{formatCurrency(Math.round(totals.spend / Math.max(totals.sales, 1)))}</TableCell>
                <TableCell className="px-4 text-right font-bold text-green">
                  {totals.spend > 0 ? '+' + Math.round((totals.revenue - totals.spend) / totals.spend * 100) + '%' : '—'}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardTitle>Monthly Spend by Source</DashboardCardTitle>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/70 hover:bg-muted/70">
                <TableHead className="px-4 text-xs uppercase tracking-wide text-muted-foreground">Month</TableHead>
                {SOURCES.map(s => (
                  <TableHead key={s} className="px-3 text-right text-xs uppercase tracking-wide text-muted-foreground">{s}</TableHead>
                ))}
                <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map(month => {
                const monthRows = marketing.filter(m => m.month === month)
                const monthTotal = monthRows.reduce((s, r) => s + r.spend, 0)
                return (
                  <TableRow key={month}>
                    <TableCell className="px-4 font-medium text-foreground">{month}</TableCell>
                    {SOURCES.map(source => {
                      const row = monthRows.find(m => m.source === source)
                      return (
                        <TableCell key={source} className="px-3 text-right text-xs text-muted-foreground">
                          {row ? formatCurrency(row.spend) : '—'}
                        </TableCell>
                      )
                    })}
                    <TableCell className="px-4 text-right font-medium text-foreground">{formatCurrency(monthTotal)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </DashboardCard>
      </main>
    </div>
  )
}

function SourceDrillDown({
  source,
  months,
  marketing,
}: {
  source: LeadSource
  months: string[]
  marketing: { source: LeadSource; month: string; spend: number; leads: number; appointments: number; sales: number; revenue: number }[]
}) {
  const rows = months.map(month => marketing.find(m => m.source === source && m.month === month)).filter(Boolean)

  if (rows.length === 0) return null

  const maxLeads = Math.max(...rows.map(r => r!.leads), 1)
  const maxSales = Math.max(...rows.map(r => r!.sales), 1)

  return (
    <DashboardCard size="sm" className="mt-2 bg-muted/60">
      <DashboardCardContent>
        <div className="grid grid-cols-2 gap-4 text-center text-xs md:grid-cols-6">
          <DrillStat label="Total Leads" value={rows.reduce((s, r) => s + r!.leads, 0)} />
          <DrillStat label="Total Appts" value={rows.reduce((s, r) => s + r!.appointments, 0)} />
          <DrillStat label="Total Sales" value={rows.reduce((s, r) => s + r!.sales, 0)} />
          <DrillStat label="Total Spend" value={formatCurrency(rows.reduce((s, r) => s + r!.spend, 0))} />
          <DrillStat label="Total Revenue" value={formatCurrency(rows.reduce((s, r) => s + r!.revenue, 0))} tone="green" />
          <DrillStat
            label="Cost / Sale"
            value={formatCurrency(Math.round(rows.reduce((s, r) => s + r!.spend, 0) / Math.max(rows.reduce((s, r) => s + r!.sales, 0), 1)))}
            tone="gold"
          />
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Monthly Trend</div>
          <div className="space-y-2">
            {rows.map(r => {
              if (!r) return null
              const leadsPct = (r.leads / maxLeads) * 100
              const salesPct = (r.sales / maxSales) * 100
              return (
                <div key={r.month} className="grid grid-cols-[80px_1fr_60px_1fr_60px] items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{r.month}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 flex-1 overflow-hidden rounded-md bg-card">
                      <div className="h-full rounded-md bg-gradient-lime" style={{ width: `${leadsPct}%` }} />
                    </div>
                    <span className="w-6 text-right font-medium text-foreground">{r.leads}</span>
                  </div>
                  <div className="text-right text-muted-foreground">{formatCurrency(r.spend)}</div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 flex-1 overflow-hidden rounded-md bg-card">
                      <div className="h-full rounded-md bg-gradient-gold" style={{ width: `${salesPct}%` }} />
                    </div>
                    <span className="w-6 text-right font-medium text-foreground">{r.sales}</span>
                  </div>
                  <div className="text-right font-medium text-green">{formatCurrency(r.revenue)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 border-t border-border pt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-gradient-lime" />
            Leads
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-gradient-gold" />
            Sales
          </div>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  )
}

function DrillStat({
  label,
  value,
  tone = 'navy',
}: {
  label: string
  value: string | number
  tone?: 'navy' | 'green' | 'gold'
}) {
  const color = tone === 'green' ? 'text-green' : tone === 'gold' ? 'text-solar' : 'text-foreground'
  return (
    <div>
      <div className={`font-semibold ${color}`}>{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  )
}
