'use client'

import { useAppData } from '@/lib/store'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US')
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getMonday(d: Date) {
  const dt = new Date(d)
  const day = dt.getDay()
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1)
  dt.setDate(diff)
  return dt
}

function EmailDigestInner() {
  const { data, loaded } = useAppData()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'preview'

  if (!loaded || !data) {
    return <div className="flex items-center justify-center min-h-screen bg-zinc-100 text-zinc-500 text-sm">Loading...</div>
  }

  const profile = data.profile
  const leads = data.leads
  const installs = data.installs
  const referrals = data.referrals
  const marketing = data.marketing
  const monday = getMonday(new Date())

  // Leads from this week
  const weekAgo = new Date(monday.getTime() - 7 * 86400000).toISOString()
  const newThisWeek = leads.filter(l => l.createdAt >= weekAgo)

  // Overdue follow-ups (no contact in 3+ days, still in opportunity stage)
  const overdue = leads.filter(l => {
    if (l.stage !== 'opportunity') return false
    return daysSince(l.lastContactedAt) >= 3
  })

  // Installs needing attention
  const needingAttention = installs.filter(i => i.status !== 'on_track')

  // Referrals needing action
  const referralActions = referrals.filter(r => r.reviewStatus !== 'completed' || !r.referralRequestSent)

  // Top source
  const sourceTotals = marketing.reduce((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + r.leads
    return acc
  }, {} as Record<string, number>)
  const topSource = Object.entries(sourceTotals).sort(([, a], [, b]) => b - a)[0]

  // Weekly totals
  const weekSpend = marketing.filter(m => m.month >= '2025-06').reduce((s, r) => s + r.spend, 0)
  const weekLeads = marketing.filter(m => m.month >= '2025-06').reduce((s, r) => s + r.leads, 0)
  const weekRevenue = marketing.filter(m => m.month >= '2025-06').reduce((s, r) => s + r.revenue, 0)

  return (
    <div style={{
      backgroundColor: '#f4f4f4',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '20px 0',
      minHeight: '100vh',
    }}>
      {/* Email container */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #8cc63f 0%, #d6e600 100%)',
          padding: '24px 32px',
          color: '#122006',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>{profile.companyName}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>Weekly Operations Summary</div>
        </div>

        {/* Date */}
        <div style={{ padding: '16px 32px', borderBottom: '1px solid #e8e8e8', fontSize: '12px', color: '#888' }}>
          Week of {formatDate(monday.toISOString())}
        </div>

        {/* Metrics Row */}
        <div style={{ padding: '20px 32px', display: 'flex', gap: '16px', borderBottom: '1px solid #e8e8e8' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1b2415' }}>{newThisWeek.length}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>New Leads</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#b33a3a' }}>{overdue.length}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Overdue</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#6fbf3a' }}>{weekRevenue > 0 ? formatCurrency(weekRevenue) : '—'}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Revenue (MTD)</div>
          </div>
        </div>

        {/* New Leads Section */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e8e8e8' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1b2415', margin: '0 0 12px 0' }}>
            🆕 New Leads This Week ({newThisWeek.length})
          </h2>
          {newThisWeek.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No new leads this week.</p>
          ) : (
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                {newThisWeek.slice(0, 8).map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 0', color: '#1b2415', fontWeight: 500 }}>{lead.name}</td>
                    <td style={{ padding: '6px 0', color: '#888', fontSize: '12px' }}>{lead.source}</td>
                    <td style={{ padding: '6px 0', color: '#888', fontSize: '12px', textAlign: 'right' }}>
                      {daysSince(lead.createdAt)}d ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Overdue Follow-ups */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e8e8e8' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1b2415', margin: '0 0 12px 0' }}>
            ⏰ Overdue Follow-ups ({overdue.length})
          </h2>
          {overdue.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>All leads have been contacted recently.</p>
          ) : (
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                {overdue.slice(0, 5).map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 0', color: '#1b2415', fontWeight: 500 }}>{lead.name}</td>
                    <td style={{ padding: '6px 0', color: '#b33a3a', fontSize: '12px' }}>
                      {daysSince(lead.lastContactedAt)}d since contact
                    </td>
                    <td style={{ padding: '6px 0', color: '#888', fontSize: '12px', textAlign: 'right' }}>
                      {lead.assignedRep}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Install Alerts */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e8e8e8' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1b2415', margin: '0 0 12px 0' }}>
            🔧 Installs Needing Attention ({needingAttention.length})
          </h2>
          {needingAttention.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>All projects on track.</p>
          ) : (
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                {needingAttention.slice(0, 5).map(inst => {
                  const labels: Record<string, string> = {
                    waiting_permit: 'Waiting on permit',
                    waiting_customer: 'Waiting on customer',
                    waiting_utility: 'Waiting on utility',
                    delayed: 'Delayed',
                  }
                  return (
                    <tr key={inst.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '6px 0', color: '#1b2415', fontWeight: 500 }}>{inst.customerName}</td>
                      <td style={{ padding: '6px 0', color: '#888', fontSize: '12px' }}>{inst.city}</td>
                      <td style={{ padding: '6px 0', color: '#b33a3a', fontSize: '12px', textAlign: 'right' }}>
                        {labels[inst.status] || inst.status}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Referral Opportunities */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e8e8e8' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1b2415', margin: '0 0 12px 0' }}>
            🌱 Referral Opportunities ({referralActions.length})
          </h2>
          {referralActions.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>All customers have been contacted.</p>
          ) : (
            <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>
              {referralActions.slice(0, 4).map(r => (
                <div key={r.id} style={{ marginBottom: '6px' }}>
                  <strong>{r.customerName}</strong> — {r.city}
                  {r.reviewStatus !== 'completed' && <span style={{ color: '#b33a3a', marginLeft: '8px' }}>Needs review</span>}
                  {!r.referralRequestSent && <span style={{ color: '#888', marginLeft: '8px' }}>Not asked for referrals</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Marketing Snapshot */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e8e8e8' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1b2415', margin: '0 0 12px 0' }}>
            📊 Marketing Snapshot
          </h2>
          {topSource && (
            <p style={{ fontSize: '13px', color: '#555', margin: '0 0 8px 0' }}>
              <strong>Top source:</strong> {topSource[0]} ({topSource[1]} leads this month)
            </p>
          )}
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
            <strong>Spend (MTD):</strong> {formatCurrency(weekSpend)} · <strong>Leads:</strong> {weekLeads}
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px', textAlign: 'center', fontSize: '11px', color: '#aaa' }}>
          <p style={{ margin: '0 0 4px 0' }}>
            This is an automated weekly summary from{' '}
            <strong style={{ color: '#666' }}>{profile.companyName} Operations Center</strong>.
          </p>
          <p style={{ margin: 0 }}>Powered by RAKE</p>
        </div>
      </div>

      {/* Demo mode notice */}
      {mode === 'preview' && (
        <div style={{ maxWidth: '600px', margin: '16px auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#888' }}>
            📬 <strong>Demo preview:</strong> This is what the weekly email looks like.
            <br />In production, it arrives every Monday morning — no login required.
            <br /><br />
            <button
              onClick={() => window.print()}
              style={{
                background: '#1b2415',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 20px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Save as PDF
            </button>
          </p>
        </div>
      )}
    </div>
  )
}

export default function EmailDigestPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-zinc-100 text-zinc-500 text-sm">Loading...</div>
    }>
      <EmailDigestInner />
    </Suspense>
  )
}
