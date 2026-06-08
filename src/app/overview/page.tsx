'use client'

import { useState } from 'react'
import { useAppData } from '@/lib/store'
import Header from '@/components/header'
import ImportLeadsDialog from '@/components/import-dialog'
import SettingsDialog from '@/components/settings-dialog'
import BeforeView from '@/components/before-view'
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardTitle,
  LoadingState,
  MetricCard,
  SolarBadge,
} from '@/components/dashboard-ui'

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US')
}

function timeUntilNoon() {
  const now = new Date()
  const h = now.getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function OverviewPage() {
  const { data, loaded, importLeads, updateProfile } = useAppData()
  const [showBefore, setShowBefore] = useState(false)

  if (!loaded || !data) {
    return <LoadingState />
  }

  const leads = data.leads
  const installs = data.installs
  const referrals = data.referrals
  const marketing = data.marketing

  const opportunities = leads.filter(l => l.stage === 'opportunity').length
  const consultationsScheduled = leads.filter(l => l.stage === 'consultation').length
  const proposalsOut = leads.filter(l => l.stage === 'proposal').length
  const contractsSigned = leads.filter(l => l.stage === 'contract').length
  const installScheduled = leads.filter(l => l.stage === 'install_scheduled').length
  const installed = leads.filter(l => l.stage === 'installed').length
  const pto = leads.filter(l => l.stage === 'pto').length

  const totalPipelineValue = leads
    .filter(l => l.contractValue)
    .reduce((sum, l) => sum + (l.contractValue || 0), 0)

  const totalProposalsValue = leads
    .filter(l => l.proposalValue && l.stage === 'proposal')
    .reduce((sum, l) => sum + (l.proposalValue || 0), 0)

  const installsOnTrack = installs.filter(i => i.status === 'on_track').length
  const installsDelayed = installs.filter(i => i.status !== 'on_track').length
  const installsThisWeek = installs.filter(i => {
    if (!i.installDate) return false
    const d = new Date(i.installDate)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo && d <= now
  }).length

  const totalReferrals = referrals.reduce((sum, r) => sum + r.referralCount, 0)
  const referralRevenue = totalReferrals * 35000 * 0.4

  const activeProjects = installs.filter(i =>
    ['consultation', 'agreement', 'site_audit', 'permitting', 'installation', 'inspection'].includes(i.stage)
  ).length

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        profile={data.profile}
        settingsButton={
          <SettingsDialog profile={data.profile} onSave={updateProfile} />
        }
      />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <section className="mb-6 overflow-hidden rounded-lg border border-primary/20 bg-gradient-lime p-6 shadow-solar">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">
                {timeUntilNoon()}, {data.profile.ownerName.split(' ')[0]}
              </h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-primary-foreground/80">
                <SolarBadge tone="navy">{opportunities + consultationsScheduled} active opportunities</SolarBadge>
                <SolarBadge tone="gold">{proposalsOut} proposals outstanding</SolarBadge>
                <SolarBadge tone="green">{installsThisWeek} installs this week</SolarBadge>
                <SolarBadge tone="lime" className="bg-card/70">
                  {formatCurrency(totalPipelineValue + totalProposalsValue)} pipeline value
                </SolarBadge>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs text-primary-foreground/60 hidden md:inline">{leads.length} leads</span>
              <button
                onClick={() => setShowBefore(!showBefore)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  showBefore
                    ? 'border-red/30 bg-red-light text-red'
                    : 'border-green/20 bg-green-light text-green'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showBefore ? 'bg-red' : 'bg-green'}`} />
                {showBefore ? 'Current State' : 'See Before →'}
              </button>
              <a
                href="/sms-alerts"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                💬 SMS Alerts
              </a>
              <a
                href="/email-digest"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                📬 Digest
              </a>
              <a
                href="/kiosk"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                🖥 Kiosk
              </a>
              <a
                href="/print-report"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                🖨 Report
              </a>
              <ImportLeadsDialog onImport={importLeads} />
            </div>
          </div>
        </section>

        {showBefore ? (
          <BeforeView leads={leads} total={leads.length} />
        ) : (
          <><div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
          <MetricCard label="New Opportunities" value={opportunities} tone="lime" />
          <MetricCard label="Consultations" value={consultationsScheduled} tone="navy" />
          <MetricCard label="Contracts Signed" value={contractsSigned} tone="green" />
          <MetricCard label="Active Projects" value={activeProjects} tone="gold" />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <DashboardCard>
            <DashboardCardTitle action={`${leads.length} total leads`}>
              Sales Operations
            </DashboardCardTitle>
            <DashboardCardContent className="space-y-3">
              <StageBar label="New Opportunities" count={opportunities} total={leads.length} color="bg-gradient-lime" />
              <StageBar label="Consultations Scheduled" count={consultationsScheduled} total={leads.length} color="bg-gradient-green" />
              <StageBar label="Proposals Delivered" count={proposalsOut} total={leads.length} color="bg-gradient-gold" />
              <StageBar label="Contracts Signed" count={contractsSigned} total={leads.length} color="bg-green" />
              <StageBar label="Installations Scheduled" count={installScheduled} total={leads.length} color="bg-yellow" />
              <StageBar label="Installed" count={installed + pto} total={leads.length} color="bg-navy-lighter" />
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardTitle action={`${installsOnTrack} on track · ${installsDelayed} needs attention`}>
              Install Queue
            </DashboardCardTitle>
            <DashboardCardContent className="space-y-2">
              {installs.slice(0, 6).map(inst => {
                const stageLabels: Record<string, string> = {
                  consultation: 'Consultation',
                  agreement: 'Agreement',
                  site_audit: 'Site Audit',
                  permitting: 'Permitting',
                  installation: 'Installation',
                  inspection: 'Inspection',
                  pto: 'PTO',
                }
                const statusTones: Record<string, 'green' | 'red' | 'gold' | 'muted'> = {
                  on_track: 'green',
                  delayed: 'red',
                  waiting_permit: 'gold',
                  waiting_customer: 'gold',
                  waiting_utility: 'gold',
                }
                return (
                  <div key={inst.id} className="flex flex-col gap-2 border-b border-border/70 py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground">{inst.customerName}</span>
                      <span className="ml-0 block text-xs text-muted-foreground sm:ml-2 sm:inline">{inst.city}</span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <SolarBadge>{stageLabels[inst.stage]}</SolarBadge>
                      <SolarBadge tone={statusTones[inst.status] || 'muted'}>
                        {inst.status.replace(/_/g, ' ')}
                      </SolarBadge>
                    </div>
                  </div>
                )
              })}
            </DashboardCardContent>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardCard>
            <DashboardCardTitle action={`${totalReferrals} referrals · ${formatCurrency(referralRevenue)} revenue`}>
              Referral Network
            </DashboardCardTitle>
            <DashboardCardContent>
              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
                <MiniStat label="Installed Customers" value={referrals.length} tone="navy" />
                <MiniStat label="Referrals Generated" value={totalReferrals} tone="gold" />
                <MiniStat label="Referral Revenue" value={formatCurrency(referralRevenue)} tone="green" />
              </div>
              <div className="space-y-1.5">
                {referrals.slice(0, 4).map(r => {
                  const reviewed = r.reviewStatus === 'completed' ? 'Reviewed' : 'Needs review'
                  const referred = r.referralRequestSent ? 'Referral sent' : 'Ask next'
                  return (
                    <div key={r.id} className="flex flex-col gap-2 border-b border-border/70 py-2 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-foreground">{r.customerName}</span>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{r.city}</span>
                        <SolarBadge tone={r.reviewStatus === 'completed' ? 'green' : 'gold'}>{reviewed}</SolarBadge>
                        <SolarBadge tone={r.referralRequestSent ? 'green' : 'muted'}>{referred}</SolarBadge>
                        <span className="font-medium text-navy">{r.referralCount} ref</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardTitle action="Last 6 months">
              Marketing Performance
            </DashboardCardTitle>
            <DashboardCardContent className="space-y-2">
              {['Meta', 'Google Ads', 'Organic', 'Referral', 'Door Knocking', 'Home Shows', 'Website'].map(source => {
                const rows = marketing.filter(m => m.source === source)
                const totalSpend = rows.reduce((s, r) => s + r.spend, 0)
                const totalLeads = rows.reduce((s, r) => s + r.leads, 0)
                const totalSales = rows.reduce((s, r) => s + r.sales, 0)
                const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0
                return (
                  <div key={source} className="grid grid-cols-[1fr_104px] items-center gap-2 border-b border-border/70 py-2 text-sm last:border-0 sm:grid-cols-[1fr_88px_48px_48px_104px]">
                    <span className="font-medium text-foreground">{source}</span>
                    <span className="hidden text-right text-muted-foreground sm:block">{formatCurrency(totalSpend)}</span>
                    <span className="hidden text-right text-muted-foreground sm:block">{totalLeads}</span>
                    <span className="hidden text-right text-muted-foreground sm:block">{totalSales}</span>
                    <span className="text-right font-medium text-navy">{formatCurrency(Math.round(cpl))}/lead</span>
                  </div>
                )
              })}
            </DashboardCardContent>
          </DashboardCard>
        </div>
        </>
      )}

      </main>
    </div>
  )
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone: 'green' | 'gold' | 'navy'
}) {
  const colors = {
    green: 'text-green',
    gold: 'text-solar',
    navy: 'text-navy',
  }

  return (
    <div className="rounded-md bg-muted/70 p-3 text-center">
      <div className={`text-2xl font-bold ${colors[tone]}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function StageBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-foreground">{label}</span>
        <span className="font-medium text-muted-foreground">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-md bg-muted">
        <div className={`h-full rounded-md transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
