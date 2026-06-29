// ===== Lead / Pipeline funnel (prototype) =====
// ponytail: pure mock data. In production these rows live in Postgres, seeded from
// visit-log attendee capture, enriched against first-party data, and converted into
// accounts. The stages mirror the funnel in the proposal: captured -> enriched ->
// consented -> nurturing -> customer.

export type LeadStage = 'captured' | 'enriched' | 'consented' | 'nurturing' | 'customer';
export type LeadChannel = 'Institution' | 'Trade' | 'HCP';

export interface LeadEvent {
  date: string;
  title: string;
  detail: string;
}

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
}

export interface StageMeta {
  key: LeadStage;
  label: string;
  hint: string;
  color: 'sky' | 'violet' | 'amber' | 'navy' | 'leaf';
}

export const LEAD_STAGES: StageMeta[] = [
  { key: 'captured', label: 'Captured', hint: 'Met in the field', color: 'sky' },
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

// Adaeze's own pipeline (rep view) spans every stage so the board reads full.
export const SEED_LEADS: Lead[] = [
  {
    id: 'ld-okeke', name: 'Dr. Ngozi Okeke', role: 'Consultant Paediatrician', org: 'Lagoon Hospital',
    channel: 'HCP', territory: 'Lekki Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 803 110 2244', stage: 'captured', completeness: 35, consent: false, enriched: false,
    metContext: 'Met in the corridor during the Lakeshore detailing visit',
    source: 'Voice log · Lakeshore visit',
    timeline: [{ date: 'Today', title: 'Captured in the field', detail: 'Added from visit-log attendees, only name, role and number so far' }],
  },
  {
    id: 'ld-balogun', name: 'Pharm. Yusuf Balogun', role: 'Branch Pharmacist', org: 'HealthPlus Ikeja',
    channel: 'Trade', territory: 'Mainland Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 805 884 1190', stage: 'captured', completeness: 30, consent: false, enriched: false,
    metContext: 'Introduced by the store manager at HealthPlus Surulere',
    source: 'Visit-log attendee',
    timeline: [{ date: 'Yesterday', title: 'Captured in the field', detail: 'Flagged as a reorder contact for the Ikeja branch' }],
  },
  {
    id: 'ld-eze', name: 'Dr. Chuka Eze', role: 'Head, Internal Medicine', org: 'Reddington Hospital',
    channel: 'HCP', territory: 'V.I. Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 802 447 9981', email: 'c.eze@reddington.ng', stage: 'enriched', completeness: 90, consent: false, enriched: true,
    dedupeNote: 'Matched to Reddington Hospital, also seen by Rep Bola Martins in March',
    metContext: 'Met after the respiratory clinical meeting',
    source: 'Visit-log attendee',
    timeline: [
      { date: '3 days ago', title: 'Captured in the field', detail: 'Name and number taken after the CM' },
      { date: '2 days ago', title: 'Enriched', detail: 'Institution, territory and email filled; duplicate flagged and merged' },
    ],
  },
  {
    id: 'ld-adeyemi', name: 'Mrs. Bisi Adeyemi', role: 'Procurement Lead', org: 'MedPlus Yaba',
    channel: 'Trade', territory: 'Mainland Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 803 456 7890', email: 'procurement@medplus-yaba.ng', stage: 'consented', completeness: 95,
    consent: true, consentDate: '2 days ago', enriched: true,
    dedupeNote: 'Linked to MedPlus Yaba account',
    metContext: 'Procurement contact for the Yaba branch',
    source: 'Visit-log attendee',
    timeline: [
      { date: '5 days ago', title: 'Captured in the field', detail: 'Met during a coverage visit' },
      { date: '4 days ago', title: 'Enriched', detail: 'Linked to the MedPlus Yaba account' },
      { date: '2 days ago', title: 'Consent recorded', detail: 'Agreed to receive product and pricing information' },
    ],
  },
  {
    id: 'ld-coker', name: 'Dr. Femi Coker', role: 'Medical Director', org: 'St. Nicholas Hospital',
    channel: 'HCP', territory: 'V.I. Cluster', region: 'South-West', repName: REP_OWNER,
    phone: '+234 806 220 5512', email: 'f.coker@stnicholas.ng', stage: 'nurturing', completeness: 100,
    consent: true, consentDate: '1 week ago', enriched: true,
    metContext: 'Introduced at a sponsored respiratory session',
    source: 'Visit-log attendee',
    timeline: [
      { date: '2 weeks ago', title: 'Captured in the field', detail: 'Met at a sponsored session' },
      { date: '10 days ago', title: 'Enriched', detail: 'Full profile completed' },
      { date: '1 week ago', title: 'Consent recorded', detail: 'Opted in to clinical and product updates' },
      { date: '3 days ago', title: 'Information sent', detail: 'Coflin Forte paediatric dosing pack emailed' },
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
      { date: '4 weeks ago', title: 'Captured in the field', detail: 'Met during a paediatric ward round' },
      { date: '3 weeks ago', title: 'Consent recorded', detail: 'Opted in to product information' },
      { date: '2 weeks ago', title: 'Converted to customer', detail: 'Now an active account in My Customers' },
    ],
  },

  // Other reps / regions, for the manager-side aggregated view.
  {
    id: 'ld-danjuma', name: 'Pharm. Aisha Danjuma', role: 'Superintendent Pharmacist', org: 'Alpha Pharmacy Enugu',
    channel: 'Trade', territory: 'Enugu Metro', region: 'South-East', repName: 'Bola Martins',
    phone: '+234 807 332 1100', stage: 'captured', completeness: 30, consent: false, enriched: false,
    metContext: 'New trade contact in Enugu', source: 'Visit-log attendee',
    timeline: [{ date: 'Today', title: 'Captured in the field', detail: 'Reorder contact, awaiting enrichment' }],
  },
  {
    id: 'ld-etim', name: 'Dr. Emem Etim', role: 'Consultant Cardiologist', org: 'UPTH Port Harcourt',
    channel: 'HCP', territory: 'PH Metro', region: 'South-South', repName: 'Peter Etim',
    phone: '+234 808 776 4521', email: 'e.etim@upth.ng', stage: 'enriched', completeness: 88, consent: false, enriched: true,
    dedupeNote: 'New record, no duplicate found',
    metContext: 'Cardio referral source', source: 'Visit-log attendee',
    timeline: [
      { date: '4 days ago', title: 'Captured in the field', detail: 'Met on a teaching-hospital round' },
      { date: '3 days ago', title: 'Enriched', detail: 'Profile completed' },
    ],
  },
  {
    id: 'ld-musa', name: 'Mr. Garba Musa', role: 'Distributor Principal', org: 'Northern Meds Ltd',
    channel: 'Trade', territory: 'Kano Trade', region: 'North-West', repName: 'Sadiq Yaro',
    phone: '+234 809 110 8843', email: 'garba@northernmeds.ng', stage: 'consented', completeness: 92,
    consent: true, consentDate: '3 days ago', enriched: true,
    metContext: 'Bulk distributor prospect', source: 'Visit-log attendee',
    timeline: [
      { date: '1 week ago', title: 'Captured in the field', detail: 'Met at a trade fair' },
      { date: '5 days ago', title: 'Enriched', detail: 'Linked to distributor registry' },
      { date: '3 days ago', title: 'Consent recorded', detail: 'Opted in to scheme and pricing updates' },
    ],
  },
  {
    id: 'ld-bello', name: 'Dr. Halima Bello', role: 'Paediatric Registrar', org: 'AKTH Kano',
    channel: 'HCP', territory: 'Kano Metro', region: 'North-West', repName: 'Sadiq Yaro',
    phone: '+234 803 901 2245', email: 'h.bello@akth.ng', stage: 'nurturing', completeness: 100,
    consent: true, consentDate: '1 week ago', enriched: true,
    metContext: 'Prescriber prospect for paediatric line', source: 'Visit-log attendee',
    timeline: [
      { date: '2 weeks ago', title: 'Captured in the field', detail: 'Met during a ward round' },
      { date: '10 days ago', title: 'Enriched', detail: 'Full profile completed' },
      { date: '1 week ago', title: 'Consent recorded', detail: 'Opted in' },
      { date: '4 days ago', title: 'Information sent', detail: 'Paediatric dosing pack shared' },
    ],
  },
];
