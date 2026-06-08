'use client'

import { useAppData } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function timeAgo(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Alert {
  id: string
  type: 'overdue' | 'install' | 'referral' | 'marketing'
  title: string
  body: string
  timestamp: Date
  read: boolean
}

export default function SMSAlertsPage() {
  const { data, loaded } = useAppData()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [counter, setCounter] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loaded || !data) return

    const now = new Date()
    const newAlerts: Alert[] = []

    // Overdue leads
    const overdue = data.leads.filter(l => {
      if (l.stage !== 'opportunity') return false
      return daysSince(l.lastContactedAt) >= 3
    })
    overdue.slice(0, 3).forEach((lead, i) => {
      newAlerts.push({
        id: `overdue-${lead.id}`,
        type: 'overdue',
        title: '⏰ Follow-up Needed',
        body: `${lead.name} hasn't been contacted in ${daysSince(lead.lastContactedAt)} days. Source: ${lead.source}. Rep: ${lead.assignedRep}.`,
        timestamp: new Date(now.getTime() - i * 30000),
        read: false,
      })
    })

    // Install issues
    const needing = data.installs.filter(i => i.status !== 'on_track')
    needing.slice(0, 3).forEach((inst, i) => {
      const labels: Record<string, string> = {
        waiting_permit: 'Waiting on permit',
        waiting_customer: 'Waiting on customer',
        waiting_utility: 'Waiting on utility',
        delayed: 'Delayed',
      }
      newAlerts.push({
        id: `install-${inst.id}`,
        type: 'install',
        title: '🔧 Install Alert',
        body: `${inst.customerName} (${inst.city}) — ${labels[inst.status] || inst.status}.`,
        timestamp: new Date(now.getTime() - (3 + i) * 60000),
        read: false,
      })
    })

    // Referral asks needed
    const referralNeeds = data.referrals.filter(r => !r.referralRequestSent)
    referralNeeds.slice(0, 2).forEach((r, i) => {
      newAlerts.push({
        id: `referral-${r.id}`,
        type: 'referral',
        title: '🌱 Referral Opportunity',
        body: `${r.customerName} (${r.city}) — System installed ${r.installDate ? timeAgo(r.installDate) : 'recently'}. Ready to ask for referrals.`,
        timestamp: new Date(now.getTime() - (6 + i) * 60000),
        read: false,
      })
    })

    // Marketing budget alert
    const juneSpend = data.marketing.filter(m => m.month >= '2025-06').reduce((s, r) => s + r.spend, 0)
    if (juneSpend > 5000) {
      newAlerts.push({
        id: 'marketing-budget',
        type: 'marketing',
        title: '📊 Spend Alert',
        body: `Marketing spend is at $${juneSpend.toLocaleString()} MTD. ${juneSpend > 8000 ? 'Approaching monthly cap.' : 'On track with budget.'}`,
        timestamp: new Date(now.getTime() - 10 * 60000),
        read: false,
      })
    }

    newAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    setAlerts(newAlerts)
  }, [loaded, data])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [alerts])

  function sendTestAlert() {
    const testAlerts: Alert[] = [
      {
        id: `test-${counter}`,
        type: 'overdue',
        title: '⏰ Follow-up Needed',
        body: 'Test alert — lead requires follow-up.',
        timestamp: new Date(),
        read: false,
      },
    ]
    setAlerts(prev => [...testAlerts, ...prev])
    setCounter(c => c + 1)
  }

  function markRead(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
  }

  if (!loaded || !data) {
    return <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 text-sm">Loading...</div>
  }

  const totalUnread = alerts.filter(a => !a.read).length

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* Top bar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">SMS Alerts</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {totalUnread} unread {totalUnread === 1 ? 'alert' : 'alerts'}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/overview"
            className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-md border border-zinc-800"
          >
            ← Back
          </a>
          <button
            onClick={sendTestAlert}
            className="text-xs text-white bg-zinc-800 hover:bg-zinc-700 transition-colors px-3 py-1.5 rounded-md border border-zinc-700"
          >
            Send Test Alert
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Phone mockup */}
        <div className="flex justify-center">
          <div className="w-[300px] bg-black rounded-[40px] p-3 shadow-2xl border border-zinc-800">
            <div className="bg-zinc-900 rounded-[32px] overflow-hidden h-[620px] flex flex-col">
              {/* Phone notch area */}
              <div className="relative flex items-center justify-center pt-5 pb-2">
                <div className="w-[120px] h-5 bg-black rounded-full" />
              </div>
              {/* Chat header */}
              <div className="px-4 pb-2 flex items-center gap-3 border-b border-zinc-800">
                <div className="w-8 h-8 rounded-full bg-gradient-lime flex items-center justify-center text-[10px] font-bold text-dark">
                  OC
                </div>
                <div>
                  <div className="text-white text-xs font-medium">Operations Center</div>
                  <div className="text-green text-[10px]">Online</div>
                </div>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {alerts.length === 0 && (
                  <div className="text-center text-zinc-600 text-xs mt-20">No alerts yet</div>
                )}
                {alerts.map(alert => (
                  <div key={alert.id} className="flex flex-col items-start">
                    <div
                      onClick={() => markRead(alert.id)}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs cursor-pointer transition-all ${
                        alert.read
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-zinc-700 text-white'
                      }`}
                    >
                      <div className="font-medium text-[11px] mb-0.5 opacity-80">{alert.title}</div>
                      <div className="leading-relaxed">{alert.body}</div>
                    </div>
                    <span className="text-[9px] text-zinc-600 mt-1 ml-1">
                      {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              {/* Text input bar */}
              <div className="px-3 py-2 border-t border-zinc-800 flex items-center gap-2">
                <div className="flex-1 bg-zinc-800 rounded-full h-8 px-3 flex items-center">
                  <span className="text-zinc-500 text-[11px]">Reply as SMS...</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-lime flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#122006" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert log */}
        <div>
          <h2 className="text-white text-sm font-medium mb-3">Alert History</h2>
          <div className="space-y-2">
            {alerts.length === 0 && (
              <p className="text-zinc-600 text-xs">No alerts generated yet.</p>
            )}
            {alerts.map(alert => {
              const borderColor =
                alert.type === 'overdue' ? 'border-l-red' :
                alert.type === 'install' ? 'border-l-amber' :
                alert.type === 'referral' ? 'border-l-green' :
                'border-l-blue'
              return (
                <div
                  key={alert.id}
                  className={`border-l-2 ${borderColor} bg-zinc-900 border border-zinc-800 border-l-2 rounded-lg px-3 py-2 ${alert.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-medium">{alert.title}</span>
                    <span className="text-zinc-600 text-[10px]">
                      {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">{alert.body}</p>
                </div>
              )
            })}
            <p className="text-zinc-700 text-[10px] text-center pt-2">
              Alerts are generated from live operations data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
