'use client'

import { SendIcon, StarIcon } from 'lucide-react'

import { useAppData } from '@/lib/store'
import Header from '@/components/header'
import SettingsDialog from '@/components/settings-dialog'
import type { Referral } from '@/lib/types'
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardTitle,
  LoadingState,
  MetricCard,
  SolarBadge,
} from '@/components/dashboard-ui'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US')
}

const countyPins: Record<string, { x: number; y: number }> = {
  'Atlantic': { x: 55, y: 45 },
  'Cape May': { x: 50, y: 70 },
  'Cumberland': { x: 40, y: 55 },
  'Ocean': { x: 75, y: 30 },
  'Burlington': { x: 70, y: 20 },
  'Camden': { x: 50, y: 15 },
  'Gloucester': { x: 40, y: 20 },
  'Salem': { x: 30, y: 25 },
}

export default function ReferralsPage() {
  const { data, loaded, updateReferral, updateProfile } = useAppData()

  if (!loaded || !data) {
    return <LoadingState />
  }

  const referrals = data.referrals
  const totalReferrals = referrals.reduce((sum, r) => sum + r.referralCount, 0)
  const referralRevenue = totalReferrals * 35000 * 0.4
  const topCustomers = [...referrals].sort((a, b) => b.referralCount - a.referralCount).slice(0, 3)
  const needsReview = referrals.filter(r => r.reviewStatus !== 'completed').length
  const needsReferralReq = referrals.filter(r => !r.referralRequestSent).length

  const cityCounts: Record<string, { count: number; referrals: number }> = {}
  referrals.forEach(r => {
    if (!cityCounts[r.city]) cityCounts[r.city] = { count: 0, referrals: 0 }
    cityCounts[r.city].count++
    cityCounts[r.city].referrals += r.referralCount
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        profile={data.profile}
        settingsButton={<SettingsDialog profile={data.profile} onSave={updateProfile} />}
      />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <MetricCard label="Installed Customers" value={referrals.length} tone="lime" />
          <MetricCard label="Referrals Generated" value={totalReferrals} tone="gold" />
          <MetricCard label="Revenue from Referrals" value={formatCurrency(referralRevenue)} tone="green" />
          <MetricCard label="Actions Needed" value={needsReview + needsReferralReq} tone="red" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashboardCard className="lg:col-span-1">
            <DashboardCardTitle>Service Area</DashboardCardTitle>
            <DashboardCardContent>
              <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-muted">
                <svg viewBox="0 0 100 130" className="h-full w-full">
                  <path
                    d="M30,5 L70,5 L85,15 L90,25 L95,35 L90,50 L85,60 L80,70 L75,80 L70,90 L65,100 L55,110 L50,115 L45,118 L40,115 L35,110 L30,105 L25,95 L20,85 L15,70 L10,55 L15,40 L20,25 L25,15 Z"
                    fill="#e8f6c1"
                    stroke="#6fbf3a"
                    strokeWidth="0.5"
                    opacity="0.7"
                  />
                  <path
                    d="M30,15 L55,10 L65,20 L70,35 L75,50 L70,65 L65,80 L60,90 L55,100 L50,105 L45,100 L40,95 L35,85 L30,75 L25,60 L22,45 L25,30 Z"
                    fill="#8cc63f"
                    opacity="0.22"
                  />

                  {referrals.map((r, i) => {
                    const county = Object.keys(countyPins).find(c =>
                      r.city.includes(c) || ['Galloway', 'Absecon', 'Egg Harbor Twp', 'Pleasantville', 'Northfield', 'Linwood', 'Somers Point', 'Brigantine', 'Margate', 'Longport', 'Ventnor'].includes(r.city) && c === 'Atlantic'
                        || ['Ocean City', 'Cape May', 'Cape May Court House'].includes(r.city) && c === 'Cape May'
                        || ['Vineland', 'Millville', 'Bridgeton'].includes(r.city) && c === 'Cumberland'
                        || ['Little Egg Harbor', 'Tuckerton', 'Manahawkin', 'Barnegat', 'Toms River', 'Forked River'].includes(r.city) && c === 'Ocean'
                        || ['Hammonton', 'Mays Landing', 'Buena', 'Estell Manor'].includes(r.city) && c === 'Atlantic'
                    )
                    const pin = county ? countyPins[county] : null
                    if (!pin) return null
                    const size = 2 + r.referralCount * 2
                    return (
                      <circle
                        key={r.id}
                        cx={pin.x - 2 + (i % 5) * 3}
                        cy={pin.y - 2 + Math.floor(i / 5) * 3}
                        r={size}
                        fill="#f7c600"
                        opacity="0.9"
                        stroke="#fffef7"
                        strokeWidth="0.5"
                      />
                    )
                  })}

                  <text x="5" y="123" fontSize="2.5" fill="#647052">Each dot = installed customer</text>
                  <circle cx="5" cy="118" r="2" fill="#f7c600" opacity="0.9" />
                </svg>
              </div>

              <div className="mt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top Neighborhoods</h3>
                <div className="space-y-2">
                  {Object.entries(cityCounts)
                    .sort(([, a], [, b]) => b.referrals - a.referrals)
                    .slice(0, 5)
                    .map(([city, info]) => (
                      <div key={city} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-foreground">{city}</span>
                        <span className="text-xs text-muted-foreground">{info.count} installs · {info.referrals} referrals</span>
                      </div>
                    ))}
                </div>
              </div>
            </DashboardCardContent>
          </DashboardCard>

          <div className="lg:col-span-2">
            <DashboardCard>
              <DashboardCardTitle action={`${referrals.length} customers`}>
                Installed Customer Network
              </DashboardCardTitle>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/70 hover:bg-muted/70">
                    <TableHead className="px-4 text-xs uppercase tracking-wide text-muted-foreground">Customer</TableHead>
                    <TableHead className="px-4 text-xs uppercase tracking-wide text-muted-foreground">Location</TableHead>
                    <TableHead className="hidden px-4 text-xs uppercase tracking-wide text-muted-foreground md:table-cell">Installed</TableHead>
                    <TableHead className="px-4 text-xs uppercase tracking-wide text-muted-foreground">Review</TableHead>
                    <TableHead className="px-4 text-xs uppercase tracking-wide text-muted-foreground">Referral Req</TableHead>
                    <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Refs</TableHead>
                    <TableHead className="px-4 text-right text-xs uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map(r => (
                    <ReferralRow key={r.id} referral={r} updateReferral={updateReferral} />
                  ))}
                </TableBody>
              </Table>
            </DashboardCard>

            <DashboardCard className="mt-4">
              <DashboardCardTitle>Top Referring Customers</DashboardCardTitle>
              <DashboardCardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {topCustomers.map((c, i) => (
                    <DashboardCard key={c.id} size="sm" className={i === 0 ? 'border-solar bg-yellow-light/40' : ''}>
                      <DashboardCardContent>
                        <div className="text-base font-bold text-navy">{c.customerName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{c.neighborhood} · {c.city}</div>
                        <div className="mt-2 text-lg font-bold text-solar">{c.referralCount}</div>
                        <div className="text-xs text-muted-foreground">referrals</div>
                      </DashboardCardContent>
                    </DashboardCard>
                  ))}
                </div>
              </DashboardCardContent>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  )
}

function ReferralRow({
  referral: r,
  updateReferral,
}: {
  referral: Referral
  updateReferral: (id: string, updates: Partial<Referral>) => void
}) {
  const reviewTone = r.reviewStatus === 'completed' ? 'green' : r.reviewStatus === 'requested' ? 'gold' : 'muted'

  return (
    <TableRow>
      <TableCell className="px-4 font-medium text-foreground">{r.customerName}</TableCell>
      <TableCell className="px-4 text-muted-foreground">{r.city}</TableCell>
      <TableCell className="hidden px-4 text-muted-foreground md:table-cell">{formatDate(r.installDate)}</TableCell>
      <TableCell className="px-4">
        <SolarBadge tone={reviewTone}>
          {r.reviewStatus === 'completed' ? 'Reviewed' : r.reviewStatus === 'requested' ? 'Requested' : 'Not Requested'}
        </SolarBadge>
      </TableCell>
      <TableCell className="px-4">
        <SolarBadge tone={r.referralRequestSent ? 'green' : 'muted'}>
          {r.referralRequestSent ? 'Sent' : 'Not Sent'}
        </SolarBadge>
      </TableCell>
      <TableCell className="px-4 text-right font-medium text-navy">{r.referralCount}</TableCell>
      <TableCell className="px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {r.reviewStatus !== 'completed' && (
            <Button
              onClick={() => updateReferral(r.id, { reviewStatus: 'requested' })}
              variant="outline"
              size="icon-sm"
              title="Request Review"
            >
              <StarIcon />
              <span className="sr-only">Request Review</span>
            </Button>
          )}
          {!r.referralRequestSent && (
            <Button
              onClick={() => updateReferral(r.id, { referralRequestSent: true })}
              variant="outline"
              size="icon-sm"
              title="Request Referral"
            >
              <SendIcon />
              <span className="sr-only">Request Referral</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
