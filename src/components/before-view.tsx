'use client'

import type { Lead } from '@/lib/types'

function formatCurrency(n?: number) {
  if (!n) return '—'
  return '$' + n.toLocaleString('en-US')
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return '—' }
}

export default function BeforeView({ leads, total }: { leads: Lead[]; total: number }) {
  return (
    <div className="space-y-6">
      {/* Bare bones stats */}
      <div className="rounded-sm border border-zinc-300 bg-white p-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-3">
          <h2 className="text-base font-bold text-zinc-800">Lead Report</h2>
          <span className="text-xs text-zinc-500">{total} records</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-xl font-bold text-zinc-800">{total}</div>
            <div className="text-zinc-500 text-xs mt-1">Total Leads</div>
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-800">
              {leads.filter(l => l.contractValue || l.proposalValue).length}
            </div>
            <div className="text-zinc-500 text-xs mt-1">With Value</div>
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-800">
              {[...new Set(leads.map(l => l.assignedRep))].length}
            </div>
            <div className="text-zinc-500 text-xs mt-1">Reps</div>
          </div>
        </div>
      </div>

      {/* Ugly spreadsheet */}
      <div className="overflow-x-auto rounded-sm border border-zinc-300 bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-100 text-left text-zinc-600">
              <th className="px-3 py-2 font-semibold border-r border-zinc-200">Name</th>
              <th className="px-3 py-2 font-semibold border-r border-zinc-200">Phone</th>
              <th className="px-3 py-2 font-semibold border-r border-zinc-200">Email</th>
              <th className="px-3 py-2 font-semibold border-r border-zinc-200">Source</th>
              <th className="px-3 py-2 font-semibold border-r border-zinc-200">Stage</th>
              <th className="px-3 py-2 font-semibold border-r border-zinc-200">Rep</th>
              <th className="px-3 py-2 font-semibold border-r border-zinc-200">Created</th>
              <th className="px-3 py-2 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {leads.slice(0, 25).map((lead, i) => (
              <tr key={lead.id} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                <td className="px-3 py-2 text-zinc-800 font-medium border-r border-zinc-200 whitespace-nowrap">
                  {lead.name}
                </td>
                <td className="px-3 py-2 text-zinc-600 border-r border-zinc-200 whitespace-nowrap">
                  {lead.phone}
                </td>
                <td className="px-3 py-2 text-zinc-600 border-r border-zinc-200 max-w-[120px] truncate">
                  {lead.email}
                </td>
                <td className="px-3 py-2 text-zinc-600 border-r border-zinc-200 whitespace-nowrap">
                  {lead.source}
                </td>
                <td className="px-3 py-2 text-zinc-600 border-r border-zinc-200 whitespace-nowrap">
                  {lead.stage.replace(/_/g, ' ')}
                </td>
                <td className="px-3 py-2 text-zinc-600 border-r border-zinc-200 whitespace-nowrap">
                  {lead.assignedRep}
                </td>
                <td className="px-3 py-2 text-zinc-500 border-r border-zinc-200 whitespace-nowrap text-[10px]">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-3 py-2 text-zinc-600 whitespace-nowrap">
                  {formatCurrency(lead.contractValue || lead.proposalValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-sm border border-zinc-300 bg-zinc-50 p-4 text-center text-xs text-zinc-500">
        <span className="font-semibold text-zinc-700 block mb-1">No upcoming tasks · No next actions · No follow-up reminders</span>
        Leads sitting in a spreadsheet. No one is tracking response time, pipeline stage, or next steps.
      </div>
    </div>
  )
}
