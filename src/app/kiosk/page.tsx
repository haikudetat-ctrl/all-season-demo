'use client'

import { useAppData } from '@/lib/store'
import { useState, useEffect, useCallback } from 'react'

function formatCurrency(n: number) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K'
  return '$' + n.toLocaleString('en-US')
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

const SLIDES = [
  'overview', 'sales', 'speed', 'install', 'referrals', 'marketing'
]

const SLIDE_LABELS: Record<string, string> = {
  overview: 'Operations Center',
  sales: 'Sales Pipeline',
  speed: 'Speed Response Center',
  install: 'Project Lifecycle',
  referrals: 'Referral Network',
  marketing: 'Marketing Performance',
}

export default function KioskPage() {
  const { data, loaded } = useAppData()
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [time, setTime] = useState(new Date())
  const [progress, setProgress] = useState(0)
  const INTERVAL = 15000

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (paused) return
    setProgress(0)
    const start = Date.now()
    const prog = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min(elapsed / INTERVAL, 1))
    }, 50)
    const adv = setTimeout(() => {
      setSlide(s => (s + 1) % SLIDES.length)
    }, INTERVAL)
    return () => {
      clearTimeout(adv)
      clearInterval(prog)
    }
  }, [slide, paused])

  const goTo = useCallback((i: number) => setSlide(i), [])

  const togglePause = useCallback(() => setPaused(p => !p), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { setSlide(s => (s + 1) % SLIDES.length); return }
      if (e.key === 'ArrowLeft') { setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length); return }
      if (e.key === ' ' || e.key === 'Escape') { e.preventDefault(); togglePause() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [togglePause])

  if (!loaded || !data) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-zinc-600 text-lg">Loading...</div>
  }

  const leads = data.leads
  const installs = data.installs
  const referrals = data.referrals
  const marketing = data.marketing

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
  const newLeads = leads.filter(l => l.createdAt >= weekAgo)
  const overdue = leads.filter(l => l.stage === 'opportunity' && daysSince(l.lastContactedAt) >= 3)
  const activeInstalls = installs.filter(i => ['consultation', 'agreement', 'site_audit', 'permitting', 'installation', 'inspection'].includes(i.stage))
  const needingAttention = installs.filter(i => i.status !== 'on_track')
  const referralCount = referrals.reduce((s, r) => s + r.referralCount, 0)

  const opportunities = leads.filter(l => l.stage === 'opportunity').length
  const proposalsOut = leads.filter(l => l.stage === 'proposal').length
  const contractsSigned = leads.filter(l => l.stage === 'contract').length
  const totalPipeline = leads.filter(l => l.contractValue).reduce((s, l) => s + (l.contractValue || 0), 0)

  return (
    <div
      className="min-h-screen bg-black text-white select-none"
      onClick={togglePause}
    >
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
            {data.profile.companyName}
          </div>
          <span className="text-zinc-700">|</span>
          <div className="text-[10px] font-mono text-zinc-500">
            {time.toLocaleDateString('en-US', { weekday: 'long' })}{' '}
            {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {paused && (
            <span className="text-[10px] font-mono text-yellow uppercase tracking-widest">Paused</span>
          )}
          <a
            href="/overview"
            className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Exit Kiosk
          </a>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-16">
        <div key={slide} className="animate-fadeIn w-full h-full flex flex-col">
          <div className="text-zinc-600 text-xs font-mono tracking-widest uppercase mb-6">
            {SLIDE_LABELS[SLIDES[slide]]}
          </div>

          {SLIDES[slide] === 'overview' && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'New Leads (7d)', value: newLeads.length, color: 'text-green' },
                  { label: 'Pipeline', value: '$' + Math.round(totalPipeline / 1000) + 'K', color: 'text-white' },
                  { label: 'Active Installs', value: activeInstalls.length, color: 'text-white' },
                  { label: 'Overdue', value: overdue.length, color: overdue.length > 0 ? 'text-red' : 'text-green' },
                ].map(m => (
                  <div key={m.label} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <div className={`text-5xl font-bold ${m.color} mb-2`}>{m.value}</div>
                    <div className="text-zinc-500 text-xs font-mono">{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <div className="text-5xl font-bold text-green mb-2">{opportunities}</div>
                  <div className="text-zinc-500 text-xs font-mono">Opportunities</div>
                </div>
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <div className="text-5xl font-bold text-yellow mb-2">{proposalsOut}</div>
                  <div className="text-zinc-500 text-xs font-mono">Proposals Out</div>
                </div>
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <div className="text-5xl font-bold text-green mb-2">{contractsSigned}</div>
                  <div className="text-zinc-500 text-xs font-mono">Contracts Signed</div>
                </div>
              </div>
            </div>
          )}

          {SLIDES[slide] === 'sales' && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-5 gap-4">
                {(['opportunity', 'consultation', 'proposal', 'contract', 'install_scheduled'] as const).map((stage, i) => {
                  const count = leads.filter(l => l.stage === stage).length
                  const vals = leads.filter(l => l.stage === stage && l.contractValue).reduce((s, l) => s + (l.contractValue || 0), 0)
                  const labels: Record<string, string> = {
                    opportunity: 'Opportunity',
                    consultation: 'Consultation',
                    proposal: 'Proposal',
                    contract: 'Contract',
                    install_scheduled: 'Install',
                  }
                  const colors = ['bg-red/20 border-red', 'bg-yellow/20 border-yellow', 'bg-yellow/20 border-yellow', 'bg-green/20 border-green', 'bg-green/20 border-green']
                  return (
                    <div key={stage} className={`${colors[i]} rounded-2xl p-6 border text-center`}>
                      <div className="text-5xl font-bold text-white mb-2">{count}</div>
                      <div className="text-zinc-400 text-xs font-mono mb-4">{labels[stage]}</div>
                      {vals > 0 && (
                        <div className="text-green text-sm font-semibold">${(vals / 1000).toFixed(0)}K</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {SLIDES[slide] === 'speed' && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Urgent', value: leads.filter(l => l.stage === 'opportunity' && daysSince(l.createdAt) >= 7).length, color: 'text-red' },
                  { label: 'Today\'s Leads', value: leads.filter(l => daysSince(l.createdAt) < 1).length, color: 'text-green' },
                  { label: 'Avg Response', value: '—', color: 'text-white' },
                ].map(m => (
                  <div key={m.label} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <div className={`text-5xl font-bold ${m.color} mb-2`}>{m.value}</div>
                    <div className="text-zinc-500 text-xs font-mono">{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="text-zinc-500 text-xs font-mono mb-4">Recent Leads</div>
                <div className="space-y-2">
                  {leads.slice(0, 5).map(l => (
                    <div key={l.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${daysSince(l.createdAt) < 1 ? 'bg-green' : daysSince(l.createdAt) < 3 ? 'bg-yellow' : 'bg-red'}`} />
                        <span className="text-sm text-white">{l.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-zinc-500">{l.source}</span>
                        <span className="text-xs text-zinc-600">{l.city}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {SLIDES[slide] === 'install' && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <div className="text-zinc-500 text-xs font-mono mb-4">Project Status</div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'On Track', value: installs.filter(i => i.status === 'on_track').length, color: 'text-green' },
                    { label: 'Needs Attention', value: needingAttention.length, color: 'text-yellow' },
                    { label: 'Active', value: activeInstalls.length, color: 'text-white' },
                    { label: 'Completed', value: installs.filter(i => i.stage === 'pto').length, color: 'text-white' },
                  ].map(m => (
                    <div key={m.label} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                      <div className={`text-5xl font-bold ${m.color} mb-2`}>{m.value}</div>
                      <div className="text-zinc-500 text-xs font-mono">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {needingAttention.length > 0 && (
                <div className="bg-zinc-900 rounded-2xl p-6 border border-red/20">
                  <div className="text-yellow text-sm font-medium mb-2">⚠ Needs Attention</div>
                  <div className="space-y-1">
                    {needingAttention.slice(0, 4).map(i => (
                      <div key={i.id} className="flex items-center gap-3 text-sm text-zinc-400">
                        <span className="text-white">{i.customerName}</span>
                        <span className="text-zinc-600">{i.city}</span>
                        <span className="text-yellow text-xs">{i.status.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {SLIDES[slide] === 'referrals' && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Total Referrals', value: referralCount, color: 'text-green' },
                  { label: 'Customers Installed', value: referrals.length, color: 'text-white' },
                  { label: 'Ready to Ask', value: referrals.filter(r => !r.referralRequestSent).length, color: 'text-yellow' },
                ].map(m => (
                  <div key={m.label} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <div className={`text-5xl font-bold ${m.color} mb-2`}>{m.value}</div>
                    <div className="text-zinc-500 text-xs font-mono">{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="text-zinc-500 text-xs font-mono mb-4">Recent Customers</div>
                <div className="grid grid-cols-3 gap-4">
                  {referrals.slice(0, 6).map(r => (
                    <div key={r.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${r.referralCount > 0 ? 'bg-green' : 'bg-zinc-700'}`} />
                      <div>
                        <div className="text-sm text-white">{r.customerName}</div>
                        <div className="text-xs text-zinc-600">{r.city}{r.referralCount > 0 ? ` · ${r.referralCount} refs` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {SLIDES[slide] === 'marketing' && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Total Leads', value: marketing.reduce((s, r) => s + r.leads, 0), color: 'text-white' },
                  { label: 'Total Revenue', value: formatCurrency(marketing.reduce((s, r) => s + r.revenue, 0)), color: 'text-green' },
                  { label: 'Spend (MTD)', value: formatCurrency(marketing.filter(m => m.month >= '2025-06').reduce((s, r) => s + r.spend, 0)), color: 'text-yellow' },
                ].map(m => (
                  <div key={m.label} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <div className={`text-5xl font-bold ${m.color} mb-2`}>{m.value}</div>
                    <div className="text-zinc-500 text-xs font-mono">{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="text-zinc-500 text-xs font-mono mb-4">Source Breakdown</div>
                <div className="space-y-3">
                  {Object.entries(
                    marketing.reduce((acc, r) => {
                      acc[r.source] = (acc[r.source] || 0) + r.leads
                      return acc
                    }, {} as Record<string, number>)
                  ).sort(([, a], [, b]) => b - a).map(([source, total]) => {
                    const totalLeads = marketing.reduce((s, r) => s + r.leads, 0)
                    const leadsPct = totalLeads > 0 ? (total / totalLeads * 100).toFixed(0) : '0'
                    return (
                      <div key={source} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">{source}</span>
                            <span className="text-zinc-500">{total} leads ({leadsPct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-lime rounded-full transition-all"
                              style={{ width: leadsPct + '%' }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i) }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === slide ? 'bg-white scale-125' : 'bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-600">
              {slide + 1} / {SLIDES.length}
            </span>
            <div className="w-24 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-500 rounded-full transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
