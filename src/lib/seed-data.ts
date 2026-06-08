import type { AppData, LeadStage, LeadSource, InstallStage, InstallStatus } from './types'

function minutesAgo(m: number): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - m)
  return d.toISOString()
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function monthsAgo(m: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - m)
  return d.toISOString()
}

const reps = [
  { name: 'Chris Miller', avgResponseTime: 4.2, appointmentsSet: 18, conversionRate: 38 },
  { name: 'Tony DiGiacomo', avgResponseTime: 6.8, appointmentsSet: 14, conversionRate: 42 },
  { name: 'Mike Sullivan', avgResponseTime: 3.5, appointmentsSet: 22, conversionRate: 35 },
  { name: 'Dave Reynolds', avgResponseTime: 12.1, appointmentsSet: 9, conversionRate: 30 },
]

const sources: LeadSource[] = ['Meta', 'Google Ads', 'Organic', 'Referral', 'Door Knocking', 'Home Shows', 'Website']

const njTowns = [
  'Galloway', 'Absecon', 'Egg Harbor Twp', 'Pleasantville', 'Northfield',
  'Linwood', 'Somers Point', 'Brigantine', 'Margate', 'Longport',
  'Ventnor', 'Atlantic City', 'Ocean City', 'Cape May', 'Cape May Court House',
  'Vineland', 'Millville', 'Bridgeton', 'Hammonton', 'Mays Landing',
  'Buena', 'Buena Vista', 'Estell Manor', 'Port Republic', 'Smithville',
  'Little Egg Harbor', 'Tuckerton', 'Manahawkin', 'Barnegat', 'Lacey Twp',
  'Forked River', 'Lanoka Harbor', 'Waretown', 'Beachwood', 'Pine Beach',
  'Island Heights', 'Toms River', 'Berkeley Twp', 'Seaside Heights', 'Seaside Park',
  'Point Pleasant', 'Brick', 'Lakewood', 'Jackson', 'Freehold',
  'Marlboro', 'Manalapan', 'Holmdel', 'Middletown', 'Red Bank',
]

const firstNames = [
  'James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Thomas',
  'Joseph', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth',
  'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Margaret', 'Betty',
  'Dorothy', 'Sandra', 'Ashley', 'Kimberly', 'Donna', 'Emily', 'Carol', 'Michelle',
  'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
  'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma',
  'Nicole', 'Helen', 'Frank', 'Edward', 'Steven', 'George', 'Kenneth', 'Paul',
  'Brian', 'Kevin', 'Timothy', 'Ronald', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Gary', 'Nicholas', 'Eric', 'Stephen', 'Jonathan', 'Larry', 'Scott', 'Justin',
  'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Patrick', 'Jack', 'Dennis',
  'Jerry', 'Alexander', 'Tyler', 'Douglas', 'Henry', 'Peter', 'Aaron', 'Carl',
  'Arthur', 'Albert', 'Joe', 'Willie', 'Gerald', 'Roger', 'Keith', 'Lawrence',
  'Terry', 'Ralph', 'Billy', 'Bruce', 'Bobby', 'Eugene',
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Collins',
  'Parker', 'Edwards', 'Stewart', 'Morris', 'Murphy', 'Cook', 'Rogers', 'Morgan',
  'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Howard', 'Ward', 'Cox',
  'Diaz', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett', 'Gray', 'James',
  'Reyes', 'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders',
  'Ross', 'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins', 'Perry', 'Butler',
  'Barnes', 'Fisher', 'Henderson', 'Coleman', 'Simmons', 'Patterson', 'Jordan',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLeads(): AppData['leads'] {
  const leads: AppData['leads'] = []
  const stages: LeadStage[] = ['opportunity', 'consultation', 'proposal', 'contract', 'install_scheduled', 'installed', 'pto']

  for (let i = 0; i < 50; i++) {
    const stage = stages[i % stages.length]
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const town = randomItem(njTowns)
    const source = randomItem(sources)
    const rep = randomItem(reps).name
    const daysOld = randomInt(0, stage === 'opportunity' ? 14 : stage === 'consultation' ? 30 : stage === 'proposal' ? 45 : 90)

    const createdAt = daysAgo(daysOld)
    const daysSinceContact = randomInt(0, daysOld)
    const lastContactedAt = daysAgo(daysSinceContact)

    const nextActions = [
      'Call to schedule consultation',
      'Send proposal follow-up',
      'Prepare financing options',
      'Schedule site audit',
      'Confirm install date',
      'Request utility paperwork',
      'Schedule inspection',
      'Follow up on PTO application',
      'Send thank-you note',
      'Request testimonial',
    ]

    const lead: AppData['leads'][number] = {
      id: `lead-${i + 1}`,
      name: `${firstName} ${lastName}`,
      phone: `(609) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      address: `${randomInt(100, 9999)} ${randomItem(['Ocean', 'Bay', 'Shore', 'Pine', 'Maple', 'Oak', 'Cedar', 'Beach', 'Sunset', 'Harbor', 'Atlantic', 'Boardwalk', 'Dune', 'Seaside', 'Meadow'])} ${randomItem(['Ave', 'St', 'Dr', 'Ln', 'Blvd', 'Ct', 'Way'])}`,
      city: town,
      source,
      stage,
      createdAt,
      lastContactedAt,
      assignedRep: rep,
      nextAction: randomItem(nextActions),
      proposalValue: stage === 'opportunity' ? undefined : randomInt(18000, 55000),
      contractValue: stage === 'proposal' || stage === 'contract' || stage === 'install_scheduled' || stage === 'installed' || stage === 'pto' ? randomInt(15000, 48000) : undefined,
      installDate: stage === 'install_scheduled' || stage === 'installed' || stage === 'pto' ? daysAgo(randomInt(1, 14)) : undefined,
      notes: '',
    }

    leads.push(lead)
  }

  return leads
}

function generateSpeedLeads(): AppData['leads'] {
  const speedLeads: AppData['leads'] = []

  const configs = [
    { name: 'Frank DiMarco', source: 'Meta' as LeadSource, minutes: 2, rep: reps[0].name },
    { name: 'Angela Rizzo', source: 'Google Ads' as LeadSource, minutes: 4, rep: reps[2].name },
    { name: 'Tom Gallagher', source: 'Website' as LeadSource, minutes: 7, rep: reps[0].name },
    { name: 'Patricia Lombardi', source: 'Referral' as LeadSource, minutes: 9, rep: reps[1].name },
    { name: 'Rich Castellano', source: 'Door Knocking' as LeadSource, minutes: 12, rep: reps[2].name },
    { name: 'Diane Marino', source: 'Home Shows' as LeadSource, minutes: 14, rep: reps[1].name },
    { name: 'Joe Paterniti', source: 'Meta' as LeadSource, minutes: 18, rep: reps[3].name },
    { name: 'Lisa Caruso', source: 'Google Ads' as LeadSource, minutes: 22, rep: reps[3].name },
    { name: 'Sal Vitale', source: 'Organic' as LeadSource, minutes: 35, rep: reps[0].name },
    { name: 'Maria DeLuca', source: 'Website' as LeadSource, minutes: 55, rep: reps[2].name },
  ]

  for (const c of configs) {
    speedLeads.push({
      id: `lead-speed-${c.minutes}`,
      name: c.name,
      phone: `(609) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      email: `${c.name.toLowerCase().replace(' ', '.')}@example.com`,
      address: `${randomInt(100, 9999)} ${randomItem(['Ocean', 'Bay', 'Shore', 'Pine', 'Maple', 'Oak', 'Cedar', 'Beach'])} ${randomItem(['Ave', 'St', 'Dr', 'Ln', 'Blvd'])}`,
      city: randomItem(njTowns),
      source: c.source,
      stage: 'opportunity',
      createdAt: minutesAgo(c.minutes),
      lastContactedAt: minutesAgo(c.minutes),
      assignedRep: c.rep,
      nextAction: 'Initial contact — call within 5 min',
    })
  }

  return speedLeads
}

function generateInstalls(): AppData['installs'] {
  const installs: AppData['installs'] = []
  const stages: InstallStage[] = ['consultation', 'agreement', 'site_audit', 'permitting', 'installation', 'inspection', 'pto']
  const statuses: InstallStatus[] = ['on_track', 'delayed', 'waiting_permit', 'waiting_customer', 'waiting_utility']

  for (let i = 0; i < 25; i++) {
    const stage = stages[i % stages.length]
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const town = randomItem(njTowns)
    const daysSinceConsult = randomInt(5, 180)

    const project: AppData['installs'][number] = {
      id: `install-${i + 1}`,
      leadId: `lead-${((i * 2 + 3) % 50) + 1}`,
      customerName: `${firstName} ${lastName}`,
      address: `${randomInt(100, 9999)} ${randomItem(['Ocean', 'Bay', 'Shore', 'Pine', 'Maple', 'Oak', 'Cedar', 'Beach', 'Sunset', 'Harbor'])} ${randomItem(['Ave', 'St', 'Dr', 'Ln', 'Blvd'])}`,
      city: town,
      stage,
      consultationDate: daysAgo(daysSinceConsult),
      agreementDate: stage !== 'consultation' ? daysAgo(daysSinceConsult - randomInt(2, 7)) : undefined,
      siteAuditDate: stage === 'site_audit' || stage === 'permitting' || stage === 'installation' || stage === 'inspection' || stage === 'pto' ? daysAgo(daysSinceConsult - randomInt(7, 14)) : undefined,
      permittingDate: stage === 'permitting' || stage === 'installation' || stage === 'inspection' || stage === 'pto' ? daysAgo(daysSinceConsult - randomInt(14, 21)) : undefined,
      installDate: stage === 'installation' || stage === 'inspection' || stage === 'pto' ? daysAgo(daysSinceConsult - randomInt(21, 30)) : undefined,
      inspectionDate: stage === 'inspection' || stage === 'pto' ? daysAgo(daysSinceConsult - randomInt(30, 40)) : undefined,
      ptoDate: stage === 'pto' ? daysAgo(daysSinceConsult - randomInt(40, 60)) : undefined,
      assignedCrew: randomItem(['Crew A', 'Crew B', 'Crew C']),
      status: stage === 'permitting' ? randomItem(['waiting_permit', 'on_track']) as InstallStatus : randomItem(statuses),
    }

    installs.push(project)
  }

  return installs
}

function generateReferrals(): AppData['referrals'] {
  const referralTowns = [
    { city: 'Galloway', neighborhood: 'Smithville', hoa: 'Smithville Community', lat: 39.5012, lng: -74.4990 },
    { city: 'Egg Harbor Twp', neighborhood: 'English Creek', hoa: 'None', lat: 39.3734, lng: -74.5947 },
    { city: 'Linwood', neighborhood: 'Linwood Estates', hoa: 'Linwood HOA', lat: 39.3398, lng: -74.5757 },
    { city: 'Ocean City', neighborhood: 'Gardens', hoa: 'None', lat: 39.2776, lng: -74.5745 },
    { city: 'Brigantine', neighborhood: 'North Brigantine', hoa: 'Brigantine HOA', lat: 39.4104, lng: -74.3646 },
    { city: 'Cape May', neighborhood: 'Cape May Point', hoa: 'None', lat: 38.9351, lng: -74.9060 },
    { city: 'Vineland', neighborhood: 'East Vineland', hoa: 'None', lat: 39.4862, lng: -74.9978 },
    { city: 'Hammonton', neighborhood: 'Hammonton Estates', hoa: 'None', lat: 39.6348, lng: -74.8024 },
    { city: 'Toms River', neighborhood: 'Silver Ridge', hoa: 'Silver Ridge HOA', lat: 39.9562, lng: -74.1955 },
    { city: 'Manahawkin', neighborhood: 'Stafford Woods', hoa: 'Stafford HOA', lat: 39.6944, lng: -74.2533 },
    { city: 'Little Egg Harbor', neighborhood: 'Mystic Shores', hoa: 'Mystic Shores HOA', lat: 39.6254, lng: -74.3476 },
    { city: 'Barnegat', neighborhood: 'Barnegat Bay Estates', hoa: 'None', lat: 39.7539, lng: -74.2250 },
  ]

  const firstNamesRef = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Barbara', 'William', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen']
  const lastNamesRef = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']

  const referrals: AppData['referrals'] = []

  for (let i = 0; i < 12; i++) {
    const town = referralTowns[i]
    const fn = firstNamesRef[i]
    const ln = lastNamesRef[i]

    referrals.push({
      id: `ref-${i + 1}`,
      customerName: `${fn} ${ln}`,
      city: town.city,
      neighborhood: town.neighborhood,
      installDate: monthsAgo(randomInt(1, 24)),
      referralCount: randomInt(0, 4),
      reviewStatus: randomItem(['not_requested', 'requested', 'completed']) as 'not_requested' | 'requested' | 'completed',
      referralRequestSent: Math.random() > 0.5,
      hoaCommunity: town.hoa,
    })
  }

  return referrals
}

function generateMarketingData(): AppData['marketing'] {
  const data: AppData['marketing'] = []
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06']

  const sourceProfiles: Record<LeadSource, {
    baseSpend: number; leadsBase: number; apptRate: number; saleRate: number; revPerSale: number
  }> = {
    'Meta':          { baseSpend: 2200, leadsBase: 24, apptRate: 0.28, saleRate: 0.20, revPerSale: 31000 },
    'Google Ads':    { baseSpend: 1600, leadsBase: 18, apptRate: 0.32, saleRate: 0.22, revPerSale: 32000 },
    'Organic':       { baseSpend: 500,  leadsBase: 10, apptRate: 0.38, saleRate: 0.25, revPerSale: 33000 },
    'Referral':      { baseSpend: 100,  leadsBase: 6,  apptRate: 0.55, saleRate: 0.45, revPerSale: 34000 },
    'Door Knocking': { baseSpend: 1400, leadsBase: 15, apptRate: 0.22, saleRate: 0.14, revPerSale: 29000 },
    'Home Shows':    { baseSpend: 2800, leadsBase: 28, apptRate: 0.26, saleRate: 0.15, revPerSale: 30000 },
    'Website':       { baseSpend: 350,  leadsBase: 8,  apptRate: 0.35, saleRate: 0.22, revPerSale: 31000 },
  }

  let id = 0
  for (let mi = 0; mi < months.length; mi++) {
    const month = months[mi]
    const growthFactor = 1 + mi * 0.04
    const seasonalBoost = mi >= 2 && mi <= 4 ? 1.15 : 1.0

    for (const [source, profile] of Object.entries(sourceProfiles)) {
      id++
      const variance = 0.85 + Math.random() * 0.3
      const combinedFactor = variance * growthFactor * seasonalBoost
      const spend = Math.round(profile.baseSpend * combinedFactor)
      const leads = Math.round(profile.leadsBase * combinedFactor * (0.95 + Math.random() * 0.1))
      const appointments = Math.round(leads * profile.apptRate * (0.9 + Math.random() * 0.2))
      const sales = Math.round(Math.max(1, appointments * profile.saleRate * (0.9 + Math.random() * 0.2)))
      const revenue = Math.round(sales * profile.revPerSale * (0.9 + Math.random() * 0.2))

      data.push({
        id: `mkt-${id}`,
        source: source as LeadSource,
        month,
        spend,
        leads: Math.max(2, leads),
        appointments: Math.max(1, appointments),
        sales: Math.max(1, sales),
        revenue: Math.max(1000, revenue),
      })
    }
  }

  return data
}

export function generateSeedData(): AppData {
  const regularLeads = generateLeads()
  const speedLeads = generateSpeedLeads()

  const allLeads = [...speedLeads, ...regularLeads]

  return {
    leads: allLeads,
    installs: generateInstalls(),
    referrals: generateReferrals(),
    marketing: generateMarketingData(),
    reps,
  }
}
