'use client'

import { useAppData } from '@/lib/store'
import { useRef } from 'react'

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US')
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STAGE_LABELS: Record<string, string> = {
  opportunity: 'Opportunity',
  consultation: 'Consultation',
  proposal: 'Proposal',
  contract: 'Contract',
  install_scheduled: 'Install Scheduled',
  installed: 'Installed',
  pto: 'PTO',
}

const STATUS_LABELS: Record<string, string> = {
  on_track: 'On Track',
  delayed: 'Delayed',
  waiting_permit: 'Waiting Permit',
  waiting_customer: 'Waiting Customer',
  waiting_utility: 'Waiting Utility',
}

export default function PrintReportPage() {
  const { data, loaded } = useAppData()
  const printRef = useRef<HTMLDivElement>(null)

  if (!loaded || !data) {
    return <div className="flex items-center justify-center min-h-screen bg-white text-zinc-400 text-sm">Loading...</div>
  }

  const { profile, leads, installs, referrals, marketing } = data

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
  const newThisWeek = leads.filter(l => l.createdAt >= weekAgo)
  const overdue = leads.filter(l => l.stage === 'opportunity' && daysSince(l.lastContactedAt) >= 3)
  const totalPipeline = leads.filter(l => l.contractValue).reduce((s, l) => s + (l.contractValue || 0), 0)
  const activeInstalls = installs.filter(i => !['pto'].includes(i.stage))
  const needingAttention = installs.filter(i => i.status !== 'on_track')
  const referralRevenue = referrals.reduce((s, r) => s + r.referralCount, 0) * 35000 * 0.4
  const totalRevenue = marketing.reduce((s, r) => s + r.revenue, 0)
  const totalSpend = marketing.reduce((s, r) => s + r.spend, 0)

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print max-w-[800px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xs text-zinc-500">
          Operations Report · {formatDate(now)}
        </div>
        <div className="flex gap-2">
          <a
            href="/overview"
            className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors px-3 py-1.5 rounded-md border border-zinc-300"
          >
            ← Back
          </a>
          <button
            onClick={() => window.print()}
            className="text-xs text-white bg-zinc-800 hover:bg-zinc-700 transition-colors px-4 py-1.5 rounded-md"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Print document */}
      <div ref={printRef} className="max-w-[800px] mx-auto bg-white shadow-sm border border-zinc-200 mb-8">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900">{profile.companyName}</h1>
              <p className="text-xs text-zinc-500 mt-0.5">{profile.tagline}</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-zinc-700">Operations Report</div>
              <div className="text-[10px] text-zinc-400">Generated {formatDate(now)}</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="px-8 py-6 border-b border-zinc-200">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Key Metrics</h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'New Leads (7d)', value: newThisWeek.length },
              { label: 'Pipeline Value', value: formatCurrency(totalPipeline) },
              { label: 'Active Installs', value: activeInstalls.length },
              { label: 'Overdue', value: overdue.length },
            ].map(m => (
              <div key={m.label} className="bg-zinc-50 rounded p-3">
                <div className="text-lg font-bold text-zinc-800">{m.value}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div className="px-8 py-6 border-b border-zinc-200">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sales Pipeline</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left py-2 text-zinc-500 font-medium">Stage</th>
                <th className="text-right py-2 text-zinc-500 font-medium">Count</th>
                <th className="text-right py-2 text-zinc-500 font-medium">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {(['opportunity', 'consultation', 'proposal', 'contract', 'install_scheduled'] as const).map(stage => {
                const count = leads.filter(l => l.stage === stage).length
                const val = leads.filter(l => l.stage === stage && l.contractValue).reduce((s, l) => s + (l.contractValue || 0), 0)
                return (
                  <tr key={stage} className="border-b border-zinc-100">
                    <td className="py-2 text-zinc-700">{STAGE_LABELS[stage]}</td>
                    <td className="py-2 text-right text-zinc-800 font-medium">{count}</td>
                    <td className="py-2 text-right text-zinc-600">{val > 0 ? formatCurrency(val) : '—'}</td>
                  </tr>
                )
              })}
              <tr className="bg-zinc-50">
                <td className="py-2 text-zinc-700 font-semibold">Total</td>
                <td className="py-2 text-right text-zinc-800 font-semibold">{leads.length}</td>
                <td className="py-2 text-right text-zinc-800 font-semibold">{formatCurrency(totalPipeline)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2">
          {/* Install Status */}
          <div className="px-8 py-6 border-r border-b border-zinc-200">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Install Projects</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 text-zinc-500 font-medium">Customer</th>
                  <th className="text-left py-2 text-zinc-500 font-medium">Status</th>
                  <th className="text-right py-2 text-zinc-500 font-medium">City</th>
                </tr>
              </thead>
              <tbody>
                {installs.slice(0, 8).map(i => (
                  <tr key={i.id} className="border-b border-zinc-100">
                    <td className="py-1.5 text-zinc-700">{i.customerName}</td>
                    <td className="py-1.5 text-zinc-600">{STATUS_LABELS[i.status] || i.status}</td>
                    <td className="py-1.5 text-right text-zinc-500">{i.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Sources */}
          <div className="px-8 py-6 border-b border-zinc-200">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Top Sources</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 text-zinc-500 font-medium">Source</th>
                  <th className="text-right py-2 text-zinc-500 font-medium">Leads</th>
                  <th className="text-right py-2 text-zinc-500 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  marketing.reduce((acc, r) => {
                    if (!acc[r.source]) acc[r.source] = { leads: 0, revenue: 0 }
                    acc[r.source].leads += r.leads
                    acc[r.source].revenue += r.revenue
                    return acc
                  }, {} as Record<string, { leads: number; revenue: number }>)
                ).sort(([, a], [, b]) => b.leads - a.leads).slice(0, 6).map(([source, vals]) => (
                  <tr key={source} className="border-b border-zinc-100">
                    <td className="py-1.5 text-zinc-700">{source}</td>
                    <td className="py-1.5 text-right text-zinc-800 font-medium">{vals.leads}</td>
                    <td className="py-1.5 text-right text-zinc-600">{formatCurrency(vals.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referral Activity */}
        <div className="px-8 py-6 border-b border-zinc-200">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Referral Activity</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left py-2 text-zinc-500 font-medium">Customer</th>
                <th className="text-left py-2 text-zinc-500 font-medium">City</th>
                <th className="text-right py-2 text-zinc-500 font-medium">Referrals</th>
                <th className="text-left py-2 text-zinc-500 font-medium">Review</th>
                <th className="text-left py-2 text-zinc-500 font-medium">Asked</th>
              </tr>
            </thead>
            <tbody>
              {referrals.slice(0, 6).map(r => (
                <tr key={r.id} className="border-b border-zinc-100">
                  <td className="py-1.5 text-zinc-700">{r.customerName}</td>
                  <td className="py-1.5 text-zinc-500">{r.city}</td>
                  <td className="py-1.5 text-right text-zinc-800 font-medium">{r.referralCount}</td>
                  <td className="py-1.5 text-zinc-600">{r.reviewStatus === 'completed' ? 'Yes' : r.reviewStatus === 'requested' ? 'Pending' : 'No'}</td>
                  <td className="py-1.5 text-zinc-600">{r.referralRequestSent ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[10px] text-zinc-400">
            Total referrals generated: {referrals.reduce((s, r) => s + r.referralCount, 0)}
          </div>
        </div>

        {/* Marketing Summary */}
        <div className="px-8 py-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Marketing Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-50 rounded p-3">
              <div className="text-lg font-bold text-zinc-800">{formatCurrency(totalSpend)}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Total Spend</div>
            </div>
            <div className="bg-zinc-50 rounded p-3">
              <div className="text-lg font-bold text-zinc-800">{formatCurrency(totalRevenue)}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Total Revenue</div>
            </div>
            <div className="bg-zinc-50 rounded p-3">
              <div className="text-lg font-bold text-zinc-800">
                {totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) + 'x' : '—'}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">ROI</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-200 flex items-center justify-between text-[9px] text-zinc-400">
          <span>{profile.companyName} · Operations Center</span>
          <span>Powered by RAKE · Page 1 of 1</span>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  )
}
