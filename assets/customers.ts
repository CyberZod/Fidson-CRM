// ===== Customer accounts + Customer 360 history (prototype) =====
// ponytail: seeded accounts with embedded history. Production reads these from Postgres,
// joined live from visits, orders, samples, complaints and conversation notes.

export type Channel = 'Institution' | 'Trade' | 'HCP';
export type Tier = 'A' | 'B' | 'C';
export type EventKind =
  | 'visit' | 'order' | 'sample' | 'complaint' | 'conversation' | 'commitment' | 'discount' | 'intel';

export interface TimelineEvent {
  kind: EventKind;
  date: string;         // display label
  title: string;
  detail: string;
  daysAgo?: number;     // drives the date-range filter; parsed from `date` when missing
  by?: string;
  medium?: 'Call' | 'Email' | 'WhatsApp' | 'In person';
  status?: string;
}

export interface Person {
  name: string;
  role: string;
}

export interface Account {
  id: string;
  name: string;
  channel: Channel;
  tier: Tier;
  territory: string;
  address: string;
  phone: string;
  email: string;
  lastVisitDays: number;
  lifetimeValue: string;
  openCommitments: number;
  people: Person[];
  timeline: TimelineEvent[];
  rep?: string;         // owning rep; accounts belong to the territory, the rep covers it
  region?: string;
}

// ===== Territory scope =====
export type ScopeRole = 'REP' | 'ASM' | 'FSM' | 'RSM';

export interface ViewerScope {
  name: string;
  role: ScopeRole;
  territories: string[];
  channels: Channel[];
}

export const TERRITORY_SHORT: Record<string, string> = {
  'Lekki Cluster': 'Lekki',
  'V.I. Cluster': 'V.I.',
  'Mainland Cluster': 'Mainland',
  'Surulere': 'Surulere',
  'Lagos Trade': 'Lagos Trade',
  'Ikeja Cluster': 'Ikeja',
  'Ibadan Metro': 'Ibadan',
  'Kano Metro': 'Kano',
};

export const REP_SCOPE: ViewerScope = {
  name: 'Adaeze Okafor', role: 'REP',
  territories: ['Lekki Cluster', 'V.I. Cluster', 'Mainland Cluster', 'Surulere', 'Lagos Trade'],
  channels: ['Institution', 'Trade', 'HCP'],
};

export const RSM_SCOPE: ViewerScope = {
  name: 'Tunde Bakare', role: 'RSM',
  territories: ['Lekki Cluster', 'V.I. Cluster', 'Mainland Cluster', 'Surulere', 'Lagos Trade', 'Ikeja Cluster', 'Ibadan Metro'],
  channels: ['Institution', 'Trade', 'HCP'],
};

// Roles that may open an account: Trade accounts sit under the FSM line, the rest under the ASM line.
export const rolesFor = (a: Pick<Account, 'channel'>): ScopeRole[] =>
  a.channel === 'Trade' ? ['REP', 'FSM', 'RSM'] : ['REP', 'ASM', 'RSM'];

export const canView = (viewer: ViewerScope, a: Pick<Account, 'territory' | 'channel'>) =>
  viewer.territories.includes(a.territory) && viewer.channels.includes(a.channel) && rolesFor(a).includes(viewer.role);

export const scopeLine = (a: Pick<Account, 'territory' | 'channel'>) =>
  `Visible to: ${TERRITORY_SHORT[a.territory] ?? a.territory} territory · ${a.channel} channel · ${rolesFor(a).join(', ')}`;

// "Today", "Yesterday", "3 days ago", "2 weeks ago", "Oct 6" -> days ago.
export const daysFromLabel = (label: string): number => {
  const s = label.trim().toLowerCase();
  if (s === 'today' || s === 'just now') return 0;
  if (s === 'yesterday') return 1;
  const m = s.match(/^(\d+)\s+(day|days|week|weeks|month|months)\s+ago$/);
  if (m) {
    const n = Number(m[1]);
    return m[2].startsWith('day') ? n : m[2].startsWith('week') ? n * 7 : n * 30;
  }
  const parsed = Date.parse(`${label} ${new Date().getFullYear()}`);
  if (!Number.isNaN(parsed)) {
    let d = Math.round((Date.now() - parsed) / 86400000);
    if (d < 0) d += 365;
    return d;
  }
  return 30;
};

export const eventDaysAgo = (e: TimelineEvent) => e.daysAgo ?? daysFromLabel(e.date);

export const ACCOUNTS: Account[] = [
  {
    id: 'acc-lakeshore', name: 'Lakeshore Specialist Hospital', channel: 'Institution', tier: 'A',
    territory: 'Lekki Cluster', region: 'South-West', rep: 'Adaeze Okafor',
    address: '13A Admiralty Way, Lekki Phase 1, Lagos', phone: '+234 801 234 5678',
    email: 'pharmacy@lakeshore.ng', lastVisitDays: 2, lifetimeValue: '₦18.4M', openCommitments: 1,
    people: [
      { name: 'Dr. Singh', role: 'Chief Pharmacist' },
      { name: 'Dr. Amaka Obi', role: 'Head, Paediatrics' },
    ],
    timeline: [
      { kind: 'commitment', date: 'Today', daysAgo: 0, title: 'Open: Astrazon clinical pack', detail: 'Dr. Singh awaiting paediatric dosing data · due Friday', status: 'Open' },
      { kind: 'conversation', medium: 'WhatsApp', date: 'Yesterday', daysAgo: 1, title: 'WhatsApp with Dr. Singh', detail: 'Confirmed the pharmacy committee meets Thursday; asked for the price list in PDF', by: 'Adaeze Okafor' },
      { kind: 'discount', date: '2 days ago', daysAgo: 2, title: '18% discount requested', detail: '₦438,000 order · pending DM sign-off', status: 'Pending' },
      { kind: 'order', date: '2 days ago', daysAgo: 2, title: 'Order FDS-0428 placed', detail: 'Coflin Forte 600mg × 120 · ₦438,000', status: 'Awaiting approval' },
      { kind: 'visit', date: '2 days ago', daysAgo: 2, title: 'Detailing visit', detail: 'Coflin paediatric ward push · 4 doctors, 2 nurses', by: 'Adaeze Okafor' },
      { kind: 'sample', date: '2 days ago', daysAgo: 2, title: 'Samples left', detail: 'Tuxil-N Syrup 100ml × 6 · batch TX-2609 · signed by Dr. Obi', status: 'Signed' },
      { kind: 'complaint', date: '9 days ago', daysAgo: 9, title: 'Late delivery on FDS-0402', detail: 'Arrived 3 days late from the Ikeja depot · resolved with distributor', status: 'Resolved' },
      { kind: 'conversation', medium: 'Email', date: '12 days ago', daysAgo: 12, title: 'Email to procurement', detail: 'Sent Q4 institutional price list and credit terms', by: 'Adaeze Okafor' },
      { kind: 'order', date: 'Oct 3', daysAgo: 19, title: 'Order FDS-0391 invoiced', detail: 'Astrazon 10mg × 300 · ₦612,000 · paid', status: 'Paid' },
      { kind: 'visit', date: 'Sep 24', daysAgo: 28, title: 'Pharmacy committee visit', detail: 'Presented Astrazon formulary file', by: 'Adaeze Okafor' },
      { kind: 'sample', date: 'Aug 30', daysAgo: 53, title: 'Samples left', detail: 'Coflin Forte 600mg × 10 · batch CF-2608', status: 'Signed' },
    ],
  },
  {
    id: 'acc-reddington', name: 'Reddington Hospital', channel: 'Institution', tier: 'A',
    territory: 'V.I. Cluster', region: 'South-West', rep: 'Adaeze Okafor',
    address: '12 Idowu Martins St, Victoria Island', phone: '+234 802 345 6789',
    email: 'procurement@reddington.ng', lastVisitDays: 5, lifetimeValue: '₦24.1M', openCommitments: 0,
    people: [{ name: 'Dr. Chuka Eze', role: 'Head, Internal Medicine' }, { name: 'Mrs. Folake Ade', role: 'Procurement Officer' }],
    timeline: [
      { kind: 'visit', date: '5 days ago', daysAgo: 5, title: 'Respiratory CM hosted', detail: '25 attendees · ₦650,000 sponsorship', by: 'Adaeze Okafor' },
      { kind: 'conversation', medium: 'Call', date: '6 days ago', daysAgo: 6, title: 'Call with Mrs. Ade', detail: 'Agreed CM logistics and a 30-day payment window', by: 'Adaeze Okafor' },
      { kind: 'complaint', date: '15 days ago', daysAgo: 15, title: 'Short-dated stock', detail: 'Coflin batch with 5 months shelf life · replaced by depot', status: 'Resolved' },
      { kind: 'order', date: 'Oct 1', daysAgo: 21, title: 'Order FDS-0427 invoiced', detail: 'Coflin Forte 600mg · ₦650,000 · paid', status: 'Paid' },
      { kind: 'sample', date: 'Sep 15', daysAgo: 37, title: 'Samples left', detail: 'Astrazon 10mg × 20 · internal medicine ward', status: 'Signed' },
    ],
  },
  {
    id: 'acc-medplus', name: 'MedPlus Yaba', channel: 'Trade', tier: 'B',
    territory: 'Mainland Cluster', region: 'South-West', rep: 'Adaeze Okafor',
    address: '88 Herbert Macaulay Way, Yaba', phone: '+234 803 456 7890',
    email: 'orders@medplus-yaba.ng', lastVisitDays: 12, lifetimeValue: '₦9.7M', openCommitments: 1,
    people: [{ name: 'Mrs. Bisi Adeyemi', role: 'Procurement Lead' }],
    timeline: [
      { kind: 'commitment', date: '12 days ago', daysAgo: 12, title: 'Open: sample promise', detail: 'Tuxil-N samples promised · not yet fulfilled', status: 'Overdue' },
      { kind: 'intel', date: '12 days ago', daysAgo: 12, title: 'Competitor: GSK pressure', detail: 'Augmentin 15% trade discount observed' },
      { kind: 'visit', date: '12 days ago', daysAgo: 12, title: 'Coverage visit', detail: 'Stock low · reorder flagged', by: 'Adaeze Okafor' },
      { kind: 'complaint', date: '20 days ago', daysAgo: 20, title: 'Invoice mismatch', detail: 'Credit note for ₦18,400 requested on INV-7731', status: 'Open' },
      { kind: 'conversation', medium: 'WhatsApp', date: '22 days ago', daysAgo: 22, title: 'WhatsApp with Mrs. Adeyemi', detail: 'Asked for Tuxil-N shelf wobblers for the counter', by: 'Adaeze Okafor' },
      { kind: 'order', date: 'Sep 18', daysAgo: 34, title: 'Order FDS-0377 invoiced', detail: 'Tuxil-N Syrup 100ml × 240 · ₦312,000', status: 'Paid' },
    ],
  },
  {
    id: 'acc-healthplus', name: 'HealthPlus Surulere', channel: 'Trade', tier: 'B',
    territory: 'Surulere', region: 'South-West', rep: 'Adaeze Okafor',
    address: '5 Adeniran Ogunsanya St, Surulere', phone: '+234 804 567 8901',
    email: 'surulere@healthplus.ng', lastVisitDays: 1, lifetimeValue: '₦6.3M', openCommitments: 0,
    people: [{ name: 'Mr. Tunde Bello', role: 'Store Manager' }],
    timeline: [
      { kind: 'discount', date: 'Today', daysAgo: 0, title: '16% discount requested', detail: '₦210,000 order · routed to NSM Trade', status: 'Pending' },
      { kind: 'order', date: 'Today', daysAgo: 0, title: 'Order FDS-0426 placed', detail: 'Tuxil-N Syrup 100ml × 160 · ₦210,000', status: 'Awaiting approval' },
      { kind: 'visit', date: 'Yesterday', daysAgo: 1, title: 'Coverage visit', detail: 'Counter stock checked · planogram fixed', by: 'Adaeze Okafor' },
      { kind: 'conversation', medium: 'Call', date: '8 days ago', daysAgo: 8, title: 'Call with Mr. Bello', detail: 'Wants weekly delivery instead of fortnightly', by: 'Adaeze Okafor' },
    ],
  },
  {
    id: 'acc-westend', name: 'WestEnd Distributors Ltd', channel: 'Trade', tier: 'A',
    territory: 'Lagos Trade', region: 'South-West', rep: 'Adaeze Okafor',
    address: 'Plot 4 Apapa Industrial Estate', phone: '+234 805 678 9012',
    email: 'supply@westend-dist.ng', lastVisitDays: 22, lifetimeValue: '₦52.8M', openCommitments: 1,
    people: [{ name: 'Chief Okonkwo', role: 'Managing Director' }],
    timeline: [
      { kind: 'commitment', date: '8 days ago', daysAgo: 8, title: 'Open: Q4 bulk scheme', detail: '12% incentive band · escalated to NSM Trade', status: 'Open' },
      { kind: 'conversation', medium: 'Email', date: '10 days ago', daysAgo: 10, title: 'Email from Chief Okonkwo', detail: 'Asked for the Q4 scheme letter before placing the December order' },
      { kind: 'visit', date: '22 days ago', daysAgo: 22, title: 'Quarterly review', detail: 'Reviewed sell-out by state · Ogun lagging', by: 'Adaeze Okafor' },
      { kind: 'order', date: 'Sep 28', daysAgo: 24, title: 'Order FDS-0418 invoiced', detail: 'Coflin bulk · ₦4.8M · 30-day terms', status: 'Paid' },
      { kind: 'complaint', date: 'Sep 10', daysAgo: 42, title: 'Damaged cartons', detail: '14 cartons of Tuxil-N crushed in transit · replaced', status: 'Resolved' },
    ],
  },
  {
    id: 'acc-singh', name: 'Dr. Amaka Obi', channel: 'HCP', tier: 'A',
    territory: 'Lekki Cluster', region: 'South-West', rep: 'Adaeze Okafor',
    address: 'Lakeshore Specialist Hospital, Paediatrics', phone: '+234 806 789 0123',
    email: 'a.obi@lakeshore.ng', lastVisitDays: 2, lifetimeValue: 'Prescriber', openCommitments: 1,
    people: [{ name: 'Lakeshore Specialist', role: 'Affiliated Institution' }],
    timeline: [
      { kind: 'commitment', date: 'Today', daysAgo: 0, title: 'Open: paediatric data pack', detail: 'Considering switch from competitor for ENT ward', status: 'Open' },
      { kind: 'visit', date: '2 days ago', daysAgo: 2, title: 'Detailing', detail: 'Coflin under-12 indication discussed', by: 'Adaeze Okafor' },
      { kind: 'sample', date: '2 days ago', daysAgo: 2, title: 'Samples left', detail: 'Tuxil-N Syrup 100ml × 6 · signed on device', status: 'Signed' },
      { kind: 'intel', date: '2 days ago', daysAgo: 2, title: 'Prescriber signal', detail: 'Open to switching from competitor paediatric line' },
      { kind: 'conversation', medium: 'WhatsApp', date: '6 days ago', daysAgo: 6, title: 'WhatsApp note', detail: 'Asked for the Coflin dosing chart for under-5s', by: 'Adaeze Okafor' },
    ],
  },
  {
    id: 'acc-stnicholas', name: 'St. Nicholas Hospital', channel: 'Institution', tier: 'A',
    territory: 'V.I. Cluster', region: 'South-West', rep: 'Adaeze Okafor',
    address: '57 Campbell St, Lagos Island', phone: '+234 806 220 5512',
    email: 'pharmacy@stnicholas.ng', lastVisitDays: 4, lifetimeValue: '₦9.8M', openCommitments: 0,
    people: [{ name: 'Dr. Femi Coker', role: 'Medical Director' }],
    timeline: [
      { kind: 'visit', date: '4 days ago', daysAgo: 4, title: 'Detailing visit', detail: 'Astrazon allergy clinic detailing', by: 'Adaeze Okafor' },
      { kind: 'order', date: 'Oct 9', daysAgo: 13, title: 'Order FDS-0409 invoiced', detail: 'Astrazon 10mg × 200 · ₦408,000', status: 'Paid' },
      { kind: 'conversation', medium: 'Email', date: 'Oct 2', daysAgo: 20, title: 'Email to Dr. Coker', detail: 'Shared respiratory session slides', by: 'Adaeze Okafor' },
    ],
  },
  {
    id: 'acc-lagoon', name: 'Lagoon Hospital VI', channel: 'Institution', tier: 'A',
    territory: 'V.I. Cluster', region: 'South-West', rep: 'Tope Adeola',
    address: '17B Bourdillon Rd, Ikoyi', phone: '+234 807 401 3300',
    email: 'supply@lagoonhospitals.com', lastVisitDays: 0, lifetimeValue: '₦11.1M', openCommitments: 1,
    people: [{ name: 'Pharm. Ronke Alabi', role: 'Head of Pharmacy' }],
    timeline: [
      { kind: 'visit', date: 'Today', daysAgo: 0, title: 'Coverage visit', detail: 'Formulary review booked for November', by: 'Tope Adeola' },
      { kind: 'commitment', date: 'Today', daysAgo: 0, title: 'Open: formulary file', detail: 'Coflin Forte dossier due before review', status: 'Open' },
      { kind: 'complaint', date: '11 days ago', daysAgo: 11, title: 'Wrong pack size delivered', detail: '60ml sent instead of 100ml · swapped', status: 'Resolved' },
    ],
  },
  {
    id: 'acc-evercare', name: 'Evercare Hospital Lekki', channel: 'Institution', tier: 'A',
    territory: 'Lekki Cluster', region: 'South-West', rep: 'Tope Adeola',
    address: '1 Admiralty Way, Lekki Phase 1', phone: '+234 809 520 1000',
    email: 'procurement@evercare.ng', lastVisitDays: 6, lifetimeValue: '₦14.6M', openCommitments: 0,
    people: [{ name: 'Dr. Kunle Ajayi', role: 'Chief Medical Officer' }],
    timeline: [
      { kind: 'visit', date: '6 days ago', daysAgo: 6, title: 'CME planning visit', detail: 'Paediatric CME pencilled for 14 Nov', by: 'Tope Adeola' },
      { kind: 'order', date: 'Oct 4', daysAgo: 18, title: 'Order FDS-0396 invoiced', detail: 'Coflin Forte 600mg · ₦720,000', status: 'Paid' },
    ],
  },
  {
    id: 'acc-eha', name: 'EHA Clinic', channel: 'Institution', tier: 'B',
    territory: 'Lekki Cluster', region: 'South-West', rep: 'Kola Adebayo',
    address: '22 Fola Osibo Rd, Lekki Phase 1', phone: '+234 810 330 7788',
    email: 'admin@ehaclinics.ng', lastVisitDays: 7, lifetimeValue: '₦2.8M', openCommitments: 0,
    people: [{ name: 'Dr. Ifeoma Nwosu', role: 'Lead Physician' }],
    timeline: [
      { kind: 'visit', date: '1 week ago', daysAgo: 7, title: 'Detailing visit', detail: 'Astrazon for the allergy clinic', by: 'Kola Adebayo' },
      { kind: 'sample', date: '1 week ago', daysAgo: 7, title: 'Samples left', detail: 'Astrazon 10mg × 10', status: 'Signed' },
    ],
  },
  {
    id: 'acc-uch', name: 'University College Hospital Ibadan', channel: 'Institution', tier: 'A',
    territory: 'Ibadan Metro', region: 'South-West', rep: 'Bimpe Ojo',
    address: 'Queen Elizabeth Rd, Agodi, Ibadan', phone: '+234 802 900 4411',
    email: 'pharmacy@uch-ibadan.org.ng', lastVisitDays: 3, lifetimeValue: '₦21.3M', openCommitments: 1,
    people: [{ name: 'Pharm. Dele Ogunyemi', role: 'Deputy Director, Pharmacy' }],
    timeline: [
      { kind: 'commitment', date: '3 days ago', daysAgo: 3, title: 'Open: tender documents', detail: 'Q1 tender pack due 4 Nov', status: 'Open' },
      { kind: 'visit', date: '3 days ago', daysAgo: 3, title: 'Tender briefing', detail: 'Respiratory line shortlisted', by: 'Bimpe Ojo' },
    ],
  },
  {
    id: 'acc-akth', name: 'Aminu Kano Teaching Hospital', channel: 'Institution', tier: 'A',
    territory: 'Kano Metro', region: 'North-West', rep: 'Sadiq Yaro',
    address: 'Zaria Rd, Kano', phone: '+234 803 640 2200',
    email: 'pharmacy@akth.org.ng', lastVisitDays: 5, lifetimeValue: '₦16.9M', openCommitments: 0,
    people: [{ name: 'Dr. Halima Bello', role: 'Paediatric Registrar' }],
    timeline: [
      { kind: 'visit', date: '5 days ago', daysAgo: 5, title: 'Ward round detailing', detail: 'Paediatric line', by: 'Sadiq Yaro' },
    ],
  },
];
