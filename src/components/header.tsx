'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CompanyProfile } from '@/lib/types'

const tabs = [
  { label: 'Overview', path: '/overview' },
  { label: 'Sales Operations', path: '/sales' },
  { label: 'Install Queue', path: '/install' },
  { label: 'Referral Network', path: '/referrals' },
  { label: 'Speed Response', path: '/speed' },
  { label: 'Marketing Performance', path: '/marketing' },
]

interface Props {
  profile: CompanyProfile
  settingsButton?: React.ReactNode
}

export default function Header({ profile, settingsButton }: Props) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {profile.logoDataUrl ? (
              <img
                src={profile.logoDataUrl}
                alt={profile.companyName}
                className="h-12 w-auto"
              />
            ) : (
              <Image
                src="/as-og-logo.svg"
                alt="AllSeason Solar"
                width={240}
                height={60}
                className="h-12 w-auto"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            )}
            <Image
              src="/PoweredBy_RAKE.svg"
              alt="Powered by RAKE"
              width={200}
              height={40}
              className="hidden sm:block h-10 w-auto opacity-70"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
          <div className="flex items-center gap-2">
            {settingsButton}
            <div className="hidden items-center gap-2 md:flex">
              <span className="h-2 w-2 rounded-full bg-gradient-lime shadow-[0_0_18px_rgb(214_230_0_/_65%)]" />
              <span className="text-sm font-medium text-muted-foreground">{profile.ownerName}</span>
              <span className="text-sm text-muted-foreground">{profile.tagline}</span>
            </div>
          </div>
        </div>
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => {
            const isActive = pathname === tab.path || (tab.path === '/overview' && pathname === '/')
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`shrink-0 rounded-t-md border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-primary bg-gradient-lime text-primary-foreground shadow-sm'
                    : 'border-transparent text-muted-foreground hover:border-primary/30 hover:bg-muted/70 hover:text-navy'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
