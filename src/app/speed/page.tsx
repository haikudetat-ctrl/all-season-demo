'use client'

import { useState } from 'react'
import { useAppData } from '@/lib/store'
import Header from '@/components/header'
import type { Lead } from '@/lib/types'
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardTitle,
  LoadingState,
  SolarBadge,
} from '@/components/dashboard-ui'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function minutesSince(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / 1000 / 60)
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

export default function SpeedPage() {
  const { data, loaded, updateLead } = useAppData()
  const [filterRep, setFilterRep] = useState<string>('all')

  if (!loaded || !data) {
    return <LoadingState />
  }

  const queuedLeads = data.leads
    .filter(l => l.stage === 'opportunity')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const filteredLeads = filterRep === 'all' ? queuedLeads : queuedLeads.filter(l => l.assignedRep === filterRep)

  const uniqueReps = [...new Set(data.leads.map(l => l.assignedRep))]

  const leaderboard = data.reps.map(rep => {
    const repLeads = data.leads.filter(l => l.assignedRep === rep.name)
    const repOpportunities = repLeads.length
    const repAppointments = repLeads.filter(l => l.stage !== 'opportunity').length
    const repConversions = repLeads.filter(l =>
      ['contract', 'install_scheduled', 'installed', 'pto'].includes(l.stage)
    ).length
    return {
      name: rep.name,
      leads: repOpportunities,
      appointments: repAppointments,
      conversions: repConversions,
      convRate: repAppointments > 0 ? Math.round((repConversions / repAppointments) * 100) : 0,
      avgResponse: rep.avgResponseTime,
    }
  }).sort((a, b) => a.avgResponse - b.avgResponse)

  function handleClaim(lead: Lead) {
    updateLead(lead.id, {
      assignedRep: 'Chris Miller',
      lastContactedAt: new Date().toISOString(),
      nextAction: 'Initial call in progress',
    })
  }

  function getRowColor(mins: number): string {
    if (mins < 5) return 'bg-green-light/70'
    if (mins < 15) return 'bg-yellow-light/70'
    return 'bg-red-light/70'
  }

  function getStatusBadge(mins: number): { label: string; tone: 'green' | 'gold' | 'red' } {
    if (mins < 5) return { label: 'Hot', tone: 'green' }
    if (mins < 15) return { label: 'Warm', tone: 'gold' }
    return { label: 'Overdue', tone: 'red' }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">Speed Response Center</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {queuedLeads.length} unassigned opportunities — every minute counts
            </p>
          </div>
          <Select value={filterRep} onValueChange={(value) => setFilterRep(value ?? 'all')}>
            <SelectTrigger className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Reps</SelectItem>
              {uniqueReps.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashboardCard className="lg:col-span-2">
            <DashboardCardTitle>Live Queue</DashboardCardTitle>
            <div className="divide-y divide-border/70">
              {filteredLeads.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">All caught up — no unassigned opportunities</div>
              )}
              {filteredLeads.map(lead => {
                const mins = minutesSince(lead.createdAt)
                const status = getStatusBadge(mins)
                return (
                  <div key={lead.id} className={`${getRowColor(mins)} px-4 py-3 flex items-center justify-between gap-4`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{lead.name}</span>
                        <SolarBadge tone={status.tone}>{status.label}</SolarBadge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{lead.source}</span>
                        <span>{lead.city}</span>
                        <span>Rep: {lead.assignedRep}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <div className={`text-right ${mins >= 15 ? 'text-red font-bold' : mins >= 5 ? 'text-yellow font-semibold' : 'text-green font-semibold'}`}>
                        <div className="text-lg leading-tight">{formatMinutes(mins)}</div>
                        <div className="text-xs">ago</div>
                      </div>
                      <Button
                        onClick={() => handleClaim(lead)}
                        className="bg-gradient-lime text-primary-foreground hover:opacity-90"
                        size="sm"
                      >
                        Claim
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardTitle>Rep Leaderboard</DashboardCardTitle>
            <DashboardCardContent className="space-y-4">
              {leaderboard.map((rep, i) => (
                <div key={rep.name} className="border-b border-border/70 pb-3 last:border-0 last:pb-0">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-primary-foreground ${i === 0 ? 'bg-gradient-gold' : 'bg-gradient-green'}`}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">{rep.name}</span>
                    </div>
                    {i === 0 && <SolarBadge tone="gold">Leading</SolarBadge>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="font-semibold text-foreground">{rep.avgResponse.toFixed(1)}m</div>
                      <div className="mt-0.5 text-muted-foreground">Avg Response</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{rep.appointments}</div>
                      <div className="mt-0.5 text-muted-foreground">Appts Set</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{rep.convRate}%</div>
                      <div className="mt-0.5 text-muted-foreground">Conversion</div>
                    </div>
                  </div>
                </div>
              ))}
            </DashboardCardContent>

            <div className="mx-4 mb-4 rounded-md border border-primary/20 bg-primary/10 p-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-navy">Tip:</span> Responding within 5 minutes increases contact rate by 100x.
                <br />Every minute of delay drops odds of connecting.
              </p>
            </div>
          </DashboardCard>
        </div>
      </main>
    </div>
  )
}
