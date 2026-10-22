// ===== Lead / Pipeline funnel (prototype) =====
// ponytail: pure mock data. In production these rows live in Postgres, seeded from
// visit-log attendee capture, enriched against first-party data, and converted into
// accounts. The stages mirror the funnel in the proposal: captured -> enriched ->
// consented -> nurturing -> customer.

import { ACCOUNTS, daysFromLabel, type Account } from './customers';

export type LeadStage = 'captured' | 'enriched' | 'consented' | 'nurturing' | 'customer';
export type LeadChannel = 'Institution' | 'Trade' | 'HCP';

export interface LeadEvent {
  date: string;
  title: string;
  detail: string;
}

// ===== NDPC consent record =====
export type ConsentType = 'processing' | 'productInfo' | 'marketing';
export type LawfulBasis = 'Consent' | 'Legitimate interest';
export type ConsentChannel = 'In person · verbal' | 'In person · signed' | 'WhatsApp' | 'Email';

export interface ConsentRecord {
  receiptId: string;
  contactName: string;
  types: ConsentType[];
  lawfulBasis: LawfulBasis;
  channel: ConsentChannel;
  capturedBy: string;
  capturedAt: string;     // ISO
  wordingVersion: string;
  signed?: boolean;
}

export const CONSENT_TYPE_LABEL: Record<ConsentType, { label: string; hint: string }> = {
  processing: { label: 'Data processing', hint: 'Store name, role, institution and phone in the Fidson CRM' },
  productInfo: { label: 'Product information', hint: 'Clinical and product updates from their Fidson rep' },
  marketing: { label: 'Marketing contact', hint: 'Invitations, CMEs and promotions by SMS, WhatsApp or email' },
};

export const CONSENT_WORDING_VERSION = 'FF-CONSENT v1.3 · approved by Fidson Legal, 02 Sep 2026';
export const CONSENT_WORDING =
  'I agree that Fidson Healthcare Plc may keep my name, role, institution and contact details, and contact me for the purposes I have ticked. ' +
  'Fidson will not sell or share my details outside Fidson and its appointed distributors. I can withdraw at any time by replying STOP, ' +
  'emailing dpo@fidson.com, or telling my Fidson representative.';

export const newReceiptId = (d = new Date()) =>
  `CR-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export interface Lead {
  id: string;
  name: string;
  role: string;
  org: string;
  channel: LeadChannel;
  territory: string;
  region: string;       // for manager-side aggregation
  repName: string;      // owning rep
  phone?: string;
  email?: string;
  stage: LeadStage;
  completeness: number; // 0-100 profile completeness
  consent: boolean;
  consentDate?: string;
  enriched: boolean;
  dedupeNote?: string;
  metContext: string;   // where/how the rep met them
  source: string;       // intake source label
  timeline: LeadEvent[];
  lastTouchedDays?: number;     // days since the last action on the lead
  slaDays?: number;             // override of the stage SLA
  consentRecord?: ConsentRecord;
  assignmentNote?: string;
}

export interface StageMeta {
  key: LeadStage;
  label: string;
  hint: string;
  color: 'sky' | 'violet' | 'amber' | 'navy' | 'leaf';
}

export const LEAD_STAGES: StageMeta[] = [
  { key: 'captured', label: 'First meeting', hint: 'Met in the field', color: 'sky' },
  { key: 'enriched', label: 'Enriched', hint: 'Profile filled & deduped', color: 'violet' },
  { key: 'consented', label: 'Consented', hint: 'Lawful basis on record', color: 'amber' },
  { key: 'nurturing', label: 'Nurturing', hint: 'Receiving information', color: 'navy' },
  { key: 'customer', label: 'Customer', hint: 'In My Customers', color: 'leaf' },
];

export const STAGE_COLOR: Record<StageMeta['color'], { chip: string; dot: string; head: string }> = {
  sky: { chip: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500', head: 'border-sky-300' },
  violet: { chip: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', head: 'border-violet-300' },
  amber: { chip: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', head: 'border-amber-300' },
  navy: { chip: 'bg-navy-100 text-navy-700', dot: 'bg-navy-500', head: 'border-navy-300' },
  leaf: { chip: 'bg-leaf-100 text-leaf-700', dot: 'bg-leaf-500', head: 'border-leaf-300' },
};

export const REP_OWNER = 'Adaeze Okafor';

// ===== Territory roster: who covers what, and who an SLA breach escalates to =====
export interface TerritoryInfo {
  short: string;
  region: string;
  asm: string;
  reps: string[];
}

export const TERRITORIES: Record<string, TerritoryInfo> = {
  'Lekki Cluster': { short: 'Lekki', region: 'South-West', asm: 'Funmi Adeola', reps: [REP_OWNER, 'Tope Adeola', 'Kola Adebayo'] },
  'V.I. Cluster': { short: 'V.I.', region: 'South-West', asm: 'Funmi Adeola', reps: [REP_OWNER, 'Chinedu Eze'] },
  'Mainland Cluster': { short: 'Mainland', region: 'South-West', asm: 'Gbenga Salami', reps: [REP_OWNER, 'Chinedu Eze'] },
  'Surulere': { short: 'Surulere', region: 'South-West', asm: 'Gbenga Salami', reps: ['Tope Adeola', REP_OWNER] },
  'Lagos Trade': { short: 'Lagos Trade', region: 'South-West', asm: 'Gbenga Salami', reps: [REP_OWNER, 'Kola Adebayo'] },
  'Ikeja Cluster': { short: 'Ikeja', region: 'South-West', asm: 'Gbenga Salami', reps: ['Kola Adebayo', 'Chinedu Eze'] },
  'Ibadan Metro': { short: 'Ibadan', region: 'South-West', asm: 'Wale Oyelaran', reps: ['Bimpe Ojo'] },
  'Enugu Metro': { short: 'Enugu', region: 'South-East', asm: 'Obinna Nwafor', reps: ['Bola Martins'] },
  'PH Metro': { short: 'PH', region: 'South-South', asm: 'Ebi Douglas', reps: ['Peter Etim'] },
  'Kano Trade': { short: 'Kano Trade', region: 'North-West', asm: 'Usman Danladi', reps: ['Sadiq Yaro'] },
  'Kano Metro': { short: 'Kano', region: 'North-West', asm: 'Usman Danladi', reps: ['Sadiq Yaro'] },
};

// Open accounts and tasks each rep carries outside the lead list.
const BASE_OPEN_LOAD: Record<string, number> = {
  [REP_OWNER]: 6, 'Tope Adeola': 4, 'Kola Adebayo': 8, 'Chinedu Eze': 12, 'Bimpe Ojo': 7,
};

export const STAGE_SLA_DAYS: Record<LeadStage, number | null> = {
  captured: 2, enriched: 3, consented: 5, nurturing: 14, customer: null,
};

// Adaeze's own pipeline (rep view) spans every stage so the board reads full.
export const SEED_LEADS: Lead[] = [
  {
    id: 'ld-okeke', name: 'Dr. Ngozi Okeke', role: 'Consultant Paediatrician', org: 'Lagoon Hospital',
    channel: 'HCP', territory: 'Lekki Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 803 110 2244', stage: 'captured', completeness: 35, consent: false, enriched: false,
    metContext: 'Met in the corridor during the Lakeshore detailing visit',
    source: 'Voice log · Lakeshore visit', lastTouchedDays: 0,
    timeline: [{ date: 'Today', title: 'Captured in the field', detail: 'Added from visit-log attendees, only name, role and number so far' }],
  },
  {
    id: 'ld-balogun', name: 'Pharm. Yusuf Balogun', role: 'Branch Pharmacist', org: 'HealthPlus Ikeja',
    channel: 'Trade', territory: 'Mainland Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 805 884 1190', stage: 'captured', completeness: 30, consent: false, enriched: false,
    metContext: 'Introduced by the store manager at HealthPlus Surulere',
    source: 'Visit-log attendee', lastTouchedDays: 5,
    timeline: [{ date: '5 days ago', title: 'Captured in the field', detail: 'Flagged as a reorder contact for the Ikeja branch' }],
  },
  {
    id: 'ld-eze', name: 'Dr. Chuka Eze', role: 'Head, Internal Medicine', org: 'Reddington Hospital',
    channel: 'HCP', territory: 'V.I. Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 802 447 9981', email: 'c.eze@reddington.ng', stage: 'enriched', completeness: 90, consent: false, enriched: true,
    dedupeNote: 'Matched to Reddington Hospital, also seen by Rep Bola Martins in March',
    metContext: 'Met after the respiratory clinical meeting',
    source: 'Visit-log attendee', lastTouchedDays: 6,
    timeline: [
      { date: '6 days ago', title: 'Enriched', detail: 'Institution, territory and email filled; duplicate flagged and merged' },
      { date: '7 days ago', title: 'Captured in the field', detail: 'Name and number taken after the CM' },
    ],
  },
  {
    id: 'ld-adeyemi', name: 'Mrs. Bisi Adeyemi', role: 'Procurement Lead', org: 'MedPlus Yaba',
    channel: 'Trade', territory: 'Mainland Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 803 456 7890', email: 'procurement@medplus-yaba.ng', stage: 'consented', completeness: 95,
    consent: true, consentDate: '2 days ago', enriched: true,
    dedupeNote: 'Linked to MedPlus Yaba account',
    metContext: 'Procurement contact for the Yaba branch',
    source: 'Visit-log attendee', lastTouchedDays: 2,
    consentRecord: {
      receiptId: 'CR-20261020-7KQ2', contactName: 'Mrs. Bisi Adeyemi', types: ['processing', 'productInfo'],
      lawfulBasis: 'Consent', channel: 'In person · signed', capturedBy: REP_OWNER,
      capturedAt: '2026-10-20T11:42:00+01:00', wordingVersion: CONSENT_WORDING_VERSION, signed: true,
    },
    timeline: [
      { date: '2 days ago', title: 'Consent recorded', detail: 'Agreed to receive product and pricing information · receipt CR-20261020-7KQ2' },
      { date: '4 days ago', title: 'Enriched', detail: 'Linked to the MedPlus Yaba account' },
      { date: '5 days ago', title: 'Captured in the field', detail: 'Met during a coverage visit' },
    ],
  },
  {
    id: 'ld-coker', name: 'Dr. Femi Coker', role: 'Medical Director', org: 'St. Nicholas Hospital',
    channel: 'HCP', territory: 'V.I. Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 806 220 5512', email: 'f.coker@stnicholas.ng', stage: 'nurturing', completeness: 100,
    consent: true, consentDate: '1 week ago', enriched: true,
    metContext: 'Introduced at a sponsored respiratory session',
    source: 'Visit-log attendee', lastTouchedDays: 3,
    timeline: [
      { date: '3 days ago', title: 'Information sent', detail: 'Coflin Forte paediatric dosing pack emailed' },
      { date: '1 week ago', title: 'Consent recorded', detail: 'Opted in to clinical and product updates' },
      { date: '10 days ago', title: 'Enriched', detail: 'Full profile completed' },
      { date: '2 weeks ago', title: 'Captured in the field', detail: 'Met at a sponsored session' },
    ],
  },
  {
    id: 'ld-obi', name: 'Dr. Amaka Obi', role: 'Head, Paediatrics', org: 'Lakeshore Specialist Hospital',
    channel: 'HCP', territory: 'Lekki Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 806 789 0123', email: 'a.obi@lakeshore.ng', stage: 'customer', completeness: 100,
    consent: true, consentDate: '3 weeks ago', enriched: true,
    metContext: 'Converted from prospect to active prescriber',
    source: 'Visit-log attendee',
    timeline: [
      { date: '2 weeks ago', title: 'Converted to customer', detail: 'Now an active account in My Customers' },
      { date: '3 weeks ago', title: 'Consent recorded', detail: 'Opted in to product information' },
      { date: '4 weeks ago', title: 'Captured in the field', detail: 'Met during a paediatric ward round' },
    ],
  },

  // Other reps / regions, for the manager-side aggregated view.
  {
    id: 'ld-ajayi', name: 'Dr. Tobi Ajayi', role: 'Paediatric Registrar', org: 'Evercare Hospital Lekki',
    channel: 'HCP', territory: 'Lekki Cluster', region: 'South-West', repName: 'Tope Adeola',
    phone: '+234 816 330 2041', stage: 'captured', completeness: 30, consent: false, enriched: false,
    metContext: 'Met at the Evercare CME planning visit', source: 'Visit-log attendee', lastTouchedDays: 4,
    timeline: [{ date: '4 days ago', title: 'Captured in the field', detail: 'Name and number only' }],
  },
  {
    id: 'ld-okafor', name: 'Pharm. Chidi Okafor', role: 'Pharmacy Manager', org: 'Alpha Pharmacy Lekki',
    channel: 'Trade', territory: 'Lekki Cluster', region: 'South-West', repName: 'Tope Adeola',
    phone: '+234 818 772 0193', email: 'chidi@alphapharmacy.ng', stage: 'enriched', completeness: 85, consent: false, enriched: true,
    dedupeNote: 'New record, no duplicate found',
    metContext: 'Walk-in pharmacy on Admiralty Way', source: 'Visit-log attendee', lastTouchedDays: 1,
    timeline: [{ date: 'Yesterday', title: 'Enriched', detail: 'Profile completed' }],
  },
  {
    id: 'ld-danjuma', name: 'Pharm. Aisha Danjuma', role: 'Superintendent Pharmacist', org: 'Alpha Pharmacy Enugu',
    channel: 'Trade', territory: 'Enugu Metro', region: 'South-East', repName: 'Bola Martins',
    phone: '+234 807 332 1100', stage: 'captured', completeness: 30, consent: false, enriched: false,
    metContext: 'New trade contact in Enugu', source: 'Visit-log attendee', lastTouchedDays: 6,
    timeline: [{ date: '6 days ago', title: 'Captured in the field', detail: 'Reorder contact, awaiting enrichment' }],
  },
  {
    id: 'ld-etim', name: 'Dr. Emem Etim', role: 'Consultant Cardiologist', org: 'UPTH Port Harcourt',
    channel: 'HCP', territory: 'PH Metro', region: 'South-South', repName: 'Peter Etim',
    phone: '+234 808 776 4521', email: 'e.etim@upth.ng', stage: 'enriched', completeness: 88, consent: false, enriched: true,
    dedupeNote: 'New record, no duplicate found',
    metContext: 'Cardio referral source', source: 'Visit-log attendee', lastTouchedDays: 3,
    timeline: [
      { date: '3 days ago', title: 'Enriched', detail: 'Profile completed' },
      { date: '4 days ago', title: 'Captured in the field', detail: 'Met on a teaching-hospital round' },
    ],
  },
  {
    id: 'ld-musa', name: 'Mr. Garba Musa', role: 'Distributor Principal', org: 'Northern Meds Ltd',
    channel: 'Trade', territory: 'Kano Trade', region: 'North-West', repName: 'Sadiq Yaro',
    phone: '+234 809 110 8843', email: 'garba@northernmeds.ng', stage: 'consented', completeness: 92,
    consent: true, consentDate: '3 days ago', enriched: true,
    metContext: 'Bulk distributor prospect', source: 'Visit-log attendee', lastTouchedDays: 9,
    timeline: [
      { date: '9 days ago', title: 'Consent recorded', detail: 'Opted in to scheme and pricing updates' },
      { date: '11 days ago', title: 'Enriched', detail: 'Linked to distributor registry' },
      { date: '2 weeks ago', title: 'Captured in the field', detail: 'Met at a trade fair' },
    ],
  },
  {
    id: 'ld-bello', name: 'Dr. Halima Bello', role: 'Paediatric Registrar', org: 'AKTH Kano',
    channel: 'HCP', territory: 'Kano Metro', region: 'North-West', repName: 'Sadiq Yaro',
    phone: '+234 803 901 2245', email: 'h.bello@akth.ng', stage: 'nurturing', completeness: 100,
    consent: true, consentDate: '1 week ago', enriched: true,
    metContext: 'Prescriber prospect for paediatric line', source: 'Visit-log attendee', lastTouchedDays: 4,
    timeline: [
      { date: '4 days ago', title: 'Information sent', detail: 'Paediatric dosing pack shared' },
      { date: '1 week ago', title: 'Consent recorded', detail: 'Opted in' },
      { date: '10 days ago', title: 'Enriched', detail: 'Full profile completed' },
      { date: '2 weeks ago', title: 'Captured in the field', detail: 'Met during a ward round' },
    ],
  },
];

// ===== SLA =====
export interface SlaStatus {
  ageDays: number;
  slaDays: number;
  breached: boolean;
  dueSoon: boolean;
  overdueBy: number;
  escalatedTo: string;
}

// A fresh handler event ("Just now") resets the clock; otherwise the seeded lastTouchedDays wins.
export const leadAgeDays = (l: Lead) => {
  const top = l.timeline[0]?.date;
  if (top && /just now/i.test(top)) return 0;
  return l.lastTouchedDays ?? (top ? daysFromLabel(top) : 0);
};

export const slaStatus = (l: Lead): SlaStatus | null => {
  const sla = l.slaDays ?? STAGE_SLA_DAYS[l.stage];
  if (sla == null) return null;
  const ageDays = leadAgeDays(l);
  const asm = TERRITORIES[l.territory]?.asm ?? 'Area Sales Manager';
  return {
    ageDays, slaDays: sla,
    breached: ageDays > sla,
    dueSoon: ageDays === sla,
    overdueBy: Math.max(0, ageDays - sla),
    escalatedTo: `ASM ${asm}`,
  };
};

// ===== Auto-assignment by territory and workload =====
export interface Assignment {
  repName: string;
  territory: string;
  region: string;
  loads: { rep: string; load: number }[];
  note: string;
}

const openLoad = (rep: string, leads: Lead[]) =>
  (BASE_OPEN_LOAD[rep] ?? 8) + leads.filter(l => l.repName === rep && l.stage !== 'customer').length;

export const assignLead = (territory: string, leads: Lead[] = SEED_LEADS, capturedBy = REP_OWNER): Assignment => {
  // Load is counted across the whole field force, not just the leads on screen.
  const byId = new Map<string, Lead>(SEED_LEADS.map(l => [l.id, l]));
  leads.forEach(l => byId.set(l.id, l));
  const all = Array.from(byId.values());
  const info = TERRITORIES[territory] ?? { short: territory, region: 'South-West', asm: '', reps: [capturedBy] };
  const loads = info.reps.map(rep => ({ rep, load: openLoad(rep, all) })).sort((a, b) => a.load - b.load);
  const pick = loads[0];
  const other = loads.find(x => x.rep === capturedBy && x.rep !== pick.rep) ?? loads[1];
  const note = other
    ? `Assigned to ${pick.rep} · lowest open load in ${info.short} (${pick.load} vs ${other.load})`
    : `Assigned to ${pick.rep} · only rep covering ${info.short}`;
  return { repName: pick.rep, territory, region: info.region, loads, note };
};

// ===== Duplicate detection =====
export interface DuplicateCandidate {
  name: string;
  phone?: string;
  org?: string;
}

export interface DuplicateMatch {
  kind: 'lead' | 'account';
  id: string;
  name: string;
  org: string;
  owner?: string;
  score: number;        // 0-100
  reasons: string[];
}

const TITLES = /\b(dr|pharm|mr|mrs|ms|miss|prof|chief|nurse|sir)\b\.?/g;
export const normName = (s: string) => s.toLowerCase().replace(TITLES, ' ').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
const ORG_NOISE = /\b(hospital|hospitals|specialist|pharmacy|pharmacies|clinic|clinics|ltd|limited|plc|the|of|medical|centre|center)\b/g;
const normOrg = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(ORG_NOISE, ' ').replace(/\s+/g, ' ').trim();
const digits = (s?: string) => (s ?? '').replace(/\D/g, '').slice(-10);

const levenshtein = (a: string, b: string) => {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
};

export const similarity = (a: string, b: string) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const sortTokens = (s: string) => s.split(' ').sort().join(' ');
  const x = sortTokens(a), y = sortTokens(b);
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length);
};

const orgMatches = (a?: string, b?: string) => {
  const x = normOrg(a ?? ''), y = normOrg(b ?? '');
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x) || similarity(x, y) >= 0.8;
};

const scoreOne = (c: DuplicateCandidate, name: string, phone?: string, org?: string) => {
  const reasons: string[] = [];
  const sim = similarity(normName(c.name), normName(name));
  const samePhone = !!digits(c.phone) && digits(c.phone) === digits(phone);
  const sameOrg = orgMatches(c.org, org);
  if (samePhone) reasons.push('Same phone number');
  if (sim >= 0.8) reasons.push(sim === 1 ? 'Same name' : `Similar name (${Math.round(sim * 100)}%)`);
  if (sameOrg && (sim >= 0.6 || samePhone)) reasons.push('Same institution');
  const isMatch = samePhone || sim >= 0.92 || (sim >= 0.8 && (sameOrg || !c.org));
  const score = Math.round(Math.min(99, Math.max(sim * 85, samePhone ? 80 : 0) + (samePhone && sim >= 0.8 ? 10 : 0) + (sameOrg ? 10 : 0)));
  return isMatch ? { score, reasons } : null;
};

// Fuzzy name / phone / institution match against open leads and existing customer accounts.
export const checkDuplicate = (
  candidate: DuplicateCandidate,
  leads: Lead[] = SEED_LEADS,
  accounts: Account[] = ACCOUNTS,
): DuplicateMatch[] => {
  const out: DuplicateMatch[] = [];
  const seen = new Set<string>();
  const allLeads = [...leads, ...SEED_LEADS.filter(s => !leads.some(l => l.id === s.id))];
  for (const l of allLeads) {
    if (seen.has(l.id)) continue;
    seen.add(l.id);
    const r = scoreOne(candidate, l.name, l.phone, l.org);
    if (r) out.push({ kind: 'lead', id: l.id, name: l.name, org: l.org, owner: l.repName, ...r });
  }
  for (const a of accounts) {
    const people = a.channel === 'HCP' ? [{ name: a.name, phone: a.phone }] : a.people.map(p => ({ name: p.name, phone: undefined as string | undefined }));
    let best: { score: number; reasons: string[] } | null = null;
    for (const p of people) {
      const r = scoreOne(candidate, p.name, p.phone ?? a.phone, a.channel === 'HCP' ? a.address : a.name);
      if (r && (!best || r.score > best.score)) best = r;
    }
    if (!best && digits(candidate.phone) && digits(candidate.phone) === digits(a.phone)) best = { score: 70, reasons: ['Same phone number as the account'] };
    if (best) out.push({ kind: 'account', id: a.id, name: a.name, org: a.channel === 'HCP' ? a.address : a.territory, owner: a.rep, ...best });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 3);
};

// Institution typed by the rep -> existing account, used to default the territory.
export const matchAccountByOrg = (org: string, accounts: Account[] = ACCOUNTS) =>
  org.trim().length < 3 ? null : accounts.find(a => a.channel !== 'HCP' && orgMatches(org, a.name)) ?? null;
