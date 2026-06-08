export type LeadStage =
  | 'opportunity'
  | 'consultation'
  | 'proposal'
  | 'contract'
  | 'install_scheduled'
  | 'installed'
  | 'pto'

export type LeadSource =
  | 'Meta'
  | 'Google Ads'
  | 'Organic'
  | 'Referral'
  | 'Door Knocking'
  | 'Home Shows'
  | 'Website'

export type InstallStage =
  | 'consultation'
  | 'agreement'
  | 'site_audit'
  | 'permitting'
  | 'installation'
  | 'inspection'
  | 'pto'

export type InstallStatus =
  | 'on_track'
  | 'delayed'
  | 'waiting_permit'
  | 'waiting_customer'
  | 'waiting_utility'

export type ReviewStatus = 'not_requested' | 'requested' | 'completed'

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  source: LeadSource
  stage: LeadStage
  createdAt: string
  lastContactedAt: string
  assignedRep: string
  nextAction: string
  proposalValue?: number
  contractValue?: number
  installDate?: string
  notes?: string
}

export interface InstallProject {
  id: string
  leadId: string
  customerName: string
  address: string
  city: string
  stage: InstallStage
  consultationDate?: string
  agreementDate?: string
  siteAuditDate?: string
  permittingDate?: string
  installDate?: string
  inspectionDate?: string
  ptoDate?: string
  assignedCrew: string
  status: InstallStatus
  notes?: string
}

export interface Referral {
  id: string
  customerName: string
  city: string
  neighborhood: string
  installDate: string
  referralCount: number
  reviewStatus: ReviewStatus
  referralRequestSent: boolean
  hoaCommunity: string
}

export interface MarketingRow {
  id: string
  source: LeadSource
  month: string
  spend: number
  leads: number
  appointments: number
  sales: number
  revenue: number
}

export interface SalesRep {
  name: string
  avgResponseTime: number
  appointmentsSet: number
  conversionRate: number
}

export interface AppData {
  leads: Lead[]
  installs: InstallProject[]
  referrals: Referral[]
  marketing: MarketingRow[]
  reps: SalesRep[]
}
