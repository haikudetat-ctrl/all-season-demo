'use client'

import { useState } from 'react'
import { useAppData } from '@/lib/store'
import Header from '@/components/header'
import type { InstallStage, InstallProject } from '@/lib/types'
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardTitle,
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

const stages: { key: InstallStage; label: string }[] = [
  { key: 'consultation', label: 'Consultation' },
  { key: 'agreement', label: 'Agreement' },
  { key: 'site_audit', label: 'Site Audit' },
  { key: 'permitting', label: 'Permitting' },
  { key: 'installation', label: 'Installation' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'pto', label: 'PTO' },
]

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusTone(status: string): 'green' | 'red' | 'gold' | 'muted' {
  switch (status) {
    case 'on_track': return 'green'
    case 'delayed': return 'red'
    case 'waiting_permit':
    case 'waiting_customer':
    case 'waiting_utility': return 'gold'
    default: return 'muted'
  }
}

function statusIndicator(status: string) {
  switch (status) {
    case 'on_track': return 'bg-green'
    case 'delayed': return 'bg-red'
    case 'waiting_permit': return 'bg-solar'
    case 'waiting_customer': return 'bg-solar'
    case 'waiting_utility': return 'bg-solar'
    default: return 'bg-muted-foreground'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'on_track': return 'On Track'
    case 'delayed': return 'Delayed'
    case 'waiting_permit': return 'Waiting on Permit'
    case 'waiting_customer': return 'Waiting on Customer'
    case 'waiting_utility': return 'Waiting on Utility'
    default: return status
  }
}

const stageOptions = stages.map(s => ({ value: s.key, label: s.label }))
const statusOptions: { value: InstallProject['status']; label: string }[] = [
  { value: 'on_track', label: 'On Track' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'waiting_permit', label: 'Waiting on Permit' },
  { value: 'waiting_customer', label: 'Waiting on Customer' },
  { value: 'waiting_utility', label: 'Waiting on Utility' },
]

export default function InstallPage() {
  const { data, loaded, updateInstall } = useAppData()
  const [selected, setSelected] = useState<InstallProject | null>(null)
  const [editStage, setEditStage] = useState<InstallStage>('consultation')
  const [editStatus, setEditStatus] = useState<InstallProject['status']>('on_track')

  if (!loaded || !data) {
    return <LoadingState />
  }

  const projects = data.installs

  const summary = {
    total: projects.length,
    onTrack: projects.filter(p => p.status === 'on_track').length,
    delayed: projects.filter(p => p.status !== 'on_track').length,
    waitingPermit: projects.filter(p => p.status === 'waiting_permit').length,
    waitingCustomer: projects.filter(p => p.status === 'waiting_customer').length,
    waitingUtility: projects.filter(p => p.status === 'waiting_utility').length,
  }

  function handleClick(p: InstallProject) {
    setSelected(p)
    setEditStage(p.stage)
    setEditStatus(p.status)
  }

  function handleSave() {
    if (!selected) return
    updateInstall(selected.id, {
      stage: editStage,
      status: editStatus,
    })
    setSelected(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-5">
          <MetricCard label="Total Projects" value={summary.total} tone="lime" />
          <MetricCard label="On Track" value={summary.onTrack} tone="green" />
          <MetricCard label="Needs Attention" value={summary.delayed} tone="red" />
          <MetricCard label="Awaiting External" value={summary.waitingPermit + summary.waitingCustomer + summary.waitingUtility} tone="gold" />
          <MetricCard label="Latest PTO" value={formatDate(projects.find(p => p.stage === 'pto')?.ptoDate)} tone="navy" />
        </div>

        <DashboardCard>
          <DashboardCardTitle>
            Install pipeline
          </DashboardCardTitle>
          <DashboardCardContent>
            <div className="mb-3 grid min-w-[920px] grid-cols-7 gap-3">
              {stages.map((s, i) => (
                <div key={s.key} className="text-center text-xs font-semibold uppercase tracking-wide text-navy">
                  {i + 1}. {s.label}
                </div>
              ))}
            </div>

            <div className="mb-5 flex min-w-[920px] gap-0">
              <div className="h-1 flex-1 rounded-full bg-gradient-lime" />
              {stages.slice(1).map((s) => (
                <div key={s.key} className="flex flex-1 items-center">
                  <span className="-mx-0.5 text-lg leading-none text-primary">▸</span>
                  <div className="h-1 flex-1 rounded-full bg-gradient-lime" />
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <div className="grid min-w-[920px] grid-cols-7 gap-3">
                {stages.map(stage => {
                  const stageProjects = projects.filter(p => p.stage === stage.key)
                  return (
                    <div key={stage.key} className="space-y-2 min-h-[200px]">
                      {stageProjects.map(project => (
                        <Button
                          key={project.id}
                          variant="outline"
                          onClick={() => handleClick(project)}
                          className="h-auto w-full justify-start rounded-md border-border bg-muted/60 p-3 text-left shadow-none hover:border-primary/50 hover:bg-primary/10"
                        >
                          <span className="block min-w-0 w-full">
                            <span className="mb-2 flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${statusIndicator(project.status)}`} />
                              <span className="truncate text-sm font-medium text-foreground">{project.customerName}</span>
                            </span>
                            <span className="block text-xs text-muted-foreground">{project.city}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">Crew: {project.assignedCrew}</span>
                            <SolarBadge tone={statusTone(project.status)} className="mt-2">
                              {statusLabel(project.status)}
                            </SolarBadge>
                          </span>
                        </Button>
                      ))}
                      {stageProjects.length === 0 && (
                        <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                          No projects
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </main>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        {selected && (
          <DialogContent className="max-w-md border-border bg-card p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-navy">{selected.customerName}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              <DetailField label="Address">{selected.address}</DetailField>
              <DetailField label="City">{selected.city}</DetailField>
              <DetailField label="Assigned Crew">{selected.assignedCrew}</DetailField>
              <DetailField label="Consultation">{formatDate(selected.consultationDate)}</DetailField>
              {selected.agreementDate && (
                <DetailField label="Agreement">{formatDate(selected.agreementDate)}</DetailField>
              )}
              {selected.installDate && (
                <DetailField label="Installation">{formatDate(selected.installDate)}</DetailField>
              )}
              {selected.ptoDate && (
                <DetailField label="PTO Date">{formatDate(selected.ptoDate)}</DetailField>
              )}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Stage</label>
                <Select value={editStage} onValueChange={(value) => setEditStage(value as InstallStage)}>
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
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</label>
                <Select value={editStatus} onValueChange={(value) => setEditStatus(value as InstallProject['status'])}>
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {statusOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>
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
