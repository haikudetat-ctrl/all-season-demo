'use client'

import { useState } from 'react'
import { useAppData } from '@/lib/store'
import Header from '@/components/header'
import SettingsDialog from '@/components/settings-dialog'
import type { LeadStage, Lead } from '@/lib/types'
import {
  DashboardCard,
  DashboardCardContent,
  DetailField,
  LoadingState,
  MetricCard,
  SolarBadge,
} from '@/components/dashboard-ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const stages: { key: LeadStage; label: string }[] = [
  { key: 'opportunity', label: 'New Opportunities' },
  { key: 'consultation', label: 'Consultations Scheduled' },
  { key: 'proposal', label: 'Proposals Delivered' },
  { key: 'contract', label: 'Contracts Signed' },
  { key: 'install_scheduled', label: 'Installations Scheduled' },
  { key: 'installed', label: 'Installed' },
  { key: 'pto', label: 'PTO / Activated' },
]

function formatCurrency(n?: number) {
  if (!n) return '—'
  return '$' + n.toLocaleString('en-US')
}

function daysSince(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return '1 day'
  return `${diff} days`
}

const stageOptions = stages.map(s => ({ value: s.key, label: s.label }))

export default function SalesPage() {
  const { data, loaded, updateLead, updateProfile } = useAppData()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [editNextAction, setEditNextAction] = useState('')
  const [editStage, setEditStage] = useState<LeadStage>('opportunity')

  if (!loaded || !data) {
    return <LoadingState />
  }

  const leadsByStage = Object.fromEntries(
    stages.map(s => [s.key, data.leads.filter(l => l.stage === s.key)])
  ) as Record<LeadStage, Lead[]>

  const totalValue = data.leads
    .filter(l => l.contractValue || l.proposalValue)
    .reduce((sum, l) => sum + (l.contractValue || l.proposalValue || 0), 0)

  const totalLeads = data.leads.length
  const withProposal = data.leads.filter(l => l.stage !== 'opportunity').length
  const closed = data.leads.filter(l => l.stage === 'contract' || l.stage === 'install_scheduled' || l.stage === 'installed' || l.stage === 'pto').length
  const appointmentRate = totalLeads > 0 ? Math.round((withProposal / totalLeads) * 100) : 0
  const closeRate = withProposal > 0 ? Math.round((closed / withProposal) * 100) : 0

  function handleLeadClick(lead: Lead) {
    setSelectedLead(lead)
    setEditNextAction(lead.nextAction)
    setEditStage(lead.stage)
  }

  function handleSave() {
    if (!selectedLead) return
    updateLead(selectedLead.id, {
      nextAction: editNextAction,
      stage: editStage,
      lastContactedAt: new Date().toISOString(),
    })
    setSelectedLead(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        profile={data.profile}
        settingsButton={<SettingsDialog profile={data.profile} onSave={updateProfile} />}
      />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <MetricCard label="Total Opportunities" value={totalLeads} tone="lime" />
          <MetricCard label="Appointment Rate" value={`${appointmentRate}%`} tone="navy" />
          <MetricCard label="Close Rate" value={`${closeRate}%`} tone="green" />
          <MetricCard label="Pipeline Value" value={formatCurrency(totalValue)} tone="gold" />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {stages.map(stage => {
            const stageLeads = leadsByStage[stage.key]
            const stageValue = stageLeads.reduce((sum, l) => sum + (l.contractValue || l.proposalValue || 0), 0)

            return (
              <DashboardCard key={stage.key} className="flex-shrink-0 w-64 bg-muted/45" size="sm">
                <div className="border-b border-border/70 bg-card px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-navy">{stage.label}</h3>
                    <SolarBadge tone="lime">{stageLeads.length}</SolarBadge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{formatCurrency(stageValue)}</div>
                </div>
                <DashboardCardContent className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
                  {stageLeads.map(lead => {
                    const isToday = daysSince(lead.lastContactedAt) === 'Today'
                    return (
                      <Button
                        key={lead.id}
                        variant="outline"
                        onClick={() => handleLeadClick(lead)}
                        className="h-auto w-full justify-start rounded-md border-border bg-card p-3 text-left shadow-none hover:border-primary/50 hover:bg-primary/10"
                      >
                        <span className="block min-w-0 w-full">
                          <span className="block text-sm font-medium leading-snug text-foreground">{lead.name}</span>
                          <span className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <SolarBadge>{lead.source}</SolarBadge>
                            <span>{lead.city}</span>
                          </span>
                          <span className="mt-2 block text-xs text-muted-foreground">
                            <span className={isToday ? 'font-medium text-red' : ''}>
                              {daysSince(lead.lastContactedAt)} since contact
                            </span>
                          </span>
                          <span className="mt-2 block truncate border-t border-border/70 pt-2 text-xs font-medium text-navy">
                            {lead.nextAction}
                          </span>
                        </span>
                      </Button>
                    )
                  })}
                  {stageLeads.length === 0 && (
                    <div className="rounded-md border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                      No opportunities
                    </div>
                  )}
                </DashboardCardContent>
              </DashboardCard>
            )
          })}
        </div>
      </main>

      <Dialog
        open={!!selectedLead}
        onOpenChange={(open) => {
          if (!open) setSelectedLead(null)
        }}
      >
        {selectedLead && (
          <DialogContent className="max-w-lg border-border bg-card p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-navy">{selectedLead.name}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Phone">{selectedLead.phone}</DetailField>
              <DetailField label="Email">
                <span className="truncate">{selectedLead.email}</span>
              </DetailField>
              <DetailField label="Address">{selectedLead.address}, {selectedLead.city}</DetailField>
              <DetailField label="Source">{selectedLead.source}</DetailField>
              <DetailField label="Assigned Rep">{selectedLead.assignedRep}</DetailField>
              <DetailField label="Last Contact">
                <span className={daysSince(selectedLead.lastContactedAt) === 'Today' ? 'font-medium text-red' : ''}>
                  {daysSince(selectedLead.lastContactedAt)} ago
                </span>
              </DetailField>
              {selectedLead.proposalValue && (
                <DetailField label="Proposal Value">{formatCurrency(selectedLead.proposalValue)}</DetailField>
              )}
              {selectedLead.contractValue && (
                <DetailField label="Contract Value">{formatCurrency(selectedLead.contractValue)}</DetailField>
              )}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Stage
                </label>
                <Select value={editStage} onValueChange={(value) => setEditStage(value as LeadStage)}>
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {stageOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Next Action
                </label>
                <input
                  type="text"
                  value={editNextAction}
                  onChange={e => setEditNextAction(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                  placeholder="What happens next?"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLead(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gradient-lime text-primary-foreground hover:opacity-90">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
