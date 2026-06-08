'use client'

import { useState, useRef, useCallback } from 'react'
import Papa from 'papaparse'
import type { Lead, LeadStage, LeadSource } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { SolarBadge } from '@/components/dashboard-ui'

const STAGE_MAP: Record<string, LeadStage> = {
  'new opportunity': 'opportunity',
  'new opp': 'opportunity',
  'opportunity': 'opportunity',
  'consultation scheduled': 'consultation',
  'consultation': 'consultation',
  'appointment': 'consultation',
  'proposal delivered': 'proposal',
  'proposal': 'proposal',
  'contract signed': 'contract',
  'contract': 'contract',
  'won': 'contract',
  'installation scheduled': 'install_scheduled',
  'install scheduled': 'install_scheduled',
  'installed': 'installed',
  'pto': 'pto',
  'activated': 'pto',
}

const SOURCE_MAP: Record<string, LeadSource> = {
  'meta': 'Meta',
  'facebook': 'Meta',
  'facebook ads': 'Meta',
  'google ads': 'Google Ads',
  'google': 'Google Ads',
  'organic': 'Organic',
  'referral': 'Referral',
  'door knocking': 'Door Knocking',
  'door to door': 'Door Knocking',
  'home shows': 'Home Shows',
  'home show': 'Home Shows',
  'event': 'Home Shows',
  'website': 'Website',
  'web': 'Website',
}

const COLUMN_ALIASES: Record<string, string> = {
  name: 'name',
  'first name': 'name',
  first_name: 'name',
  'customer name': 'name',
  customer: 'name',
  phone: 'phone',
  'phone number': 'phone',
  phone_number: 'phone',
  telephone: 'phone',
  email: 'email',
  'e-mail': 'email',
  address: 'address',
  street: 'address',
  'street address': 'address',
  city: 'city',
  source: 'source',
  'lead source': 'source',
  lead_source: 'source',
  stage: 'stage',
  status: 'stage',
  'lead stage': 'stage',
  lead_stage: 'stage',
  notes: 'notes',
  comment: 'notes',
  'next action': 'nextAction',
  next_action: 'nextAction',
  next: 'nextAction',
  value: 'proposalValue',
  'proposal value': 'proposalValue',
  proposal_value: 'proposalValue',
  amount: 'proposalValue',
  rep: 'assignedRep',
  'assigned rep': 'assignedRep',
  assigned_rep: 'assignedRep',
  'sales rep': 'assignedRep',
  'assigned to': 'assignedRep',
}

function parseStage(raw: string): LeadStage {
  const clean = raw.toLowerCase().trim()
  return STAGE_MAP[clean] || 'opportunity'
}

function parseSource(raw: string): LeadSource {
  const clean = raw.toLowerCase().trim()
  return SOURCE_MAP[clean] || 'Website'
}

let importIdCounter = 0

function rowToLead(row: Record<string, string>, mapping: Record<string, string>): Lead {
  importIdCounter++
  const get = (field: string) => {
    const col = Object.entries(mapping).find(([, v]) => v === field)?.[0]
    return col ? (row[col] || '').trim() : ''
  }

  const name = get('name') || `Imported Lead ${importIdCounter}`
  const stage = parseStage(get('stage'))
  const source = parseSource(get('source'))

  const rawValue = get('proposalValue')
  const proposalValue = rawValue ? parseInt(rawValue.replace(/[$,]/g, ''), 10) || undefined : undefined

  return {
    id: `imported-${Date.now()}-${importIdCounter}`,
    name,
    phone: get('phone'),
    email: get('email'),
    address: get('address'),
    city: get('city'),
    source,
    stage,
    createdAt: new Date().toISOString(),
    lastContactedAt: new Date().toISOString(),
    assignedRep: get('assignedRep') || 'Unassigned',
    nextAction: get('nextAction') || 'Review and assign',
    proposalValue,
    notes: get('notes'),
  }
}

const FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'address', label: 'Address', required: false },
  { key: 'city', label: 'City', required: false },
  { key: 'source', label: 'Source', required: false },
  { key: 'stage', label: 'Stage', required: false },
  { key: 'nextAction', label: 'Next Action', required: false },
  { key: 'proposalValue', label: 'Value', required: false },
  { key: 'assignedRep', label: 'Rep', required: false },
  { key: 'notes', label: 'Notes', required: false },
]

export default function ImportLeadsDialog({ onImport }: { onImport: (leads: Lead[]) => void }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importedCount, setImportedCount] = useState(0)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const reset = useCallback(() => {
    setStep('upload')
    setRawRows([])
    setHeaders([])
    setMapping({})
    setImportedCount(0)
    setFileName('')
    setDragOver(false)
  }, [])

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file.')
      return
    }

    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const hdrs = results.meta.fields || []
        const rows = results.data as Record<string, string>[]

        if (hdrs.length === 0 || rows.length === 0) {
          alert('CSV appears empty. Check the file and try again.')
          return
        }

        setHeaders(hdrs)
        setRawRows(rows)

        // Auto-detect mapping
        const autoMap: Record<string, string> = {}
        for (const h of hdrs) {
          const clean = h.toLowerCase().trim()
          const mapped = COLUMN_ALIASES[clean]
          if (mapped) autoMap[h] = mapped
        }
        setMapping(autoMap)
        setStep('preview')
      },
      error() {
        alert('Failed to parse CSV. Check the file format.')
      },
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleImport() {
    const leads = rawRows.map(row => rowToLead(row, mapping))
    onImport(leads)
    setImportedCount(leads.length)
    setStep('done')
  }

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger>
        <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent bg-gradient-lime px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-solar transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none">
          Import Leads
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-navy">
            {step === 'upload' && 'Import Leads from CSV'}
            {step === 'preview' && `Preview — ${rawRows.length} leads found`}
            {step === 'done' && 'Import Complete'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'upload' && 'Drop your lead list CSV or click to browse. We\'ll map the columns automatically.'}
            {step === 'preview' && 'Review the mapped columns and preview the first rows before importing.'}
            {step === 'done' && `${importedCount} leads added to your Operations Center.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div
            ref={fileInputRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              dragOver
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <div className="text-3xl mb-3">📄</div>
            <p className="text-sm font-medium text-foreground">Drop your CSV here or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">Columns like Name, Phone, Email, Source, Stage, Value</p>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            {/* Column mapping */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Column Mapping</p>
              <div className="flex flex-wrap gap-2">
                {headers.map(h => {
                  const mapped = mapping[h] || '—'
                  const isRequired = FIELDS.find(f => f.key === mapped)?.required
                  return (
                    <div key={h} className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-xs">
                      <span className="font-medium text-foreground">{h}</span>
                      <span className="text-muted-foreground">→</span>
                      <select
                        value={mapped}
                        onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value }))}
                        className="rounded-sm border-0 bg-transparent text-xs font-medium text-navy outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">— Skip —</option>
                        {FIELDS.map(f => (
                          <option key={f.key} value={f.key}>
                            {f.label}{f.required ? ' *' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Preview rows */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Preview (first {Math.min(5, rawRows.length)} of {rawRows.length} rows)
              </p>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/70">
                      {headers.map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rawRows.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {headers.map(h => (
                          <td key={h} className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate">
                            {row[h] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-3 text-4xl">✓</div>
            <p className="text-lg font-semibold text-navy">{importedCount} leads imported</p>
            <p className="mt-1 text-sm text-muted-foreground">
              They&apos;re now live in your Operations Center across all views.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <SolarBadge tone="green">Sales Operations</SolarBadge>
              <SolarBadge tone="green">Speed Response</SolarBadge>
              <SolarBadge tone="green">Install Queue</SolarBadge>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={reset}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                className="bg-gradient-lime text-primary-foreground hover:opacity-90 shadow-solar"
              >
                Import {rawRows.length} Leads
              </Button>
            </>
          )}
          {step === 'done' && (
            <Button onClick={() => setOpen(false)} className="bg-gradient-lime text-primary-foreground hover:opacity-90 shadow-solar">
              View Operations Center
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
