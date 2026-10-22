import { createContext, useContext, useState, type ReactNode } from 'react';
import type { HcpType, VisitLog, VisitLogAttendees } from '../types';

// ===== Shapes =====
export type StockLevel = 'in' | 'low' | 'out';

export interface RetailAudit {
  stock: Record<string, StockLevel>;
  facings: boolean;
  planogram: boolean;
  priceTag: boolean;
  posUp: boolean | null;
  posPhoto?: string;
}

export interface SampleLine {
  id: string;
  sku: string;
  batch: string;
  qty: number;
  recipient: string;
}

export const INTEL_CATEGORIES = ['Pricing', 'Promotion', 'New launch', 'Stock-out', 'Detailing activity'] as const;
export type IntelCategory = typeof INTEL_CATEGORIES[number];

export interface CapturedSignature {
  signer: string;
  dataUrl: string;
  signedAt: string;
  consent: string;
}

export interface ComplaintDraft {
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  product: string;
  batch: string;
  description: string;
}

export interface VisitDraft {
  checkedIn: boolean;
  checkInAt: number | null;
  checkInLabel: string;
  location: { lat: number; lng: number } | null;
  manualLocation: boolean;
  hcpType: HcpType;
  hcpName: string;
  institution: string;
  specialty: string;
  email: string;
  phone: string;
  products: string[];
  attendees: VisitLogAttendees;
  otherGroups: { label: string; count: number }[];
  summary: string;
  nextSteps: string;
  competitorBrand: string;
  competitorPromo: string;
  competitorPricing: string;
  intelCategories: IntelCategory[];
  reminderDate: string;
  retailAuditOn: boolean;
  retailAudit: RetailAudit;
  samples: SampleLine[];
  signature: CapturedSignature | null;
  complaintIds: string[];
  complaintDraft: ComplaintDraft;
  prefilledFrom: number;
  prefillReviewed: boolean;
  prefillBannerOpen: boolean;
}

export interface CallRecord {
  logId: string;
  visitId?: string;
  repName: string;
  timestamp: string;
  checkInAt?: string;
  institution: string;
  hcpName: string;
  samples: SampleLine[];
  intelCategories: IntelCategory[];
  retailAudit?: RetailAudit;
  signature?: CapturedSignature | null;
  complaintIds: string[];
}

export interface FieldOrder {
  id: string;
  visitId?: string;
  repName: string;
  customer: string;
  total: number;
  signedBy?: string;
  at: string;
}

export interface PastInteraction {
  date: string;
  hcpName: string;
  hcpType: HcpType;
  specialty: string;
  products: string[];
  summary: string;
  nextStep: string;
}

export type ComplaintCategory = 'Product quality' | 'Adverse event' | 'Delivery' | 'Pricing' | 'Service';
export type ComplaintSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type ComplaintStatus = 'New' | 'Acknowledged' | 'Investigating' | 'Resolved';

export interface ComplaintEvent {
  at: string;
  by: string;
  text: string;
}

export interface Complaint {
  id: string;
  loggedAt: string;
  repName: string;
  customer: string;
  hcpName: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  product: string;
  batch: string;
  description: string;
  status: ComplaintStatus;
  owner: string;
  resolutionNote: string;
  pvReferredAt?: string;
  visitId?: string;
  events: ComplaintEvent[];
}

// ===== Reference data =====
export const COMPLAINT_CATEGORIES: ComplaintCategory[] = ['Product quality', 'Adverse event', 'Delivery', 'Pricing', 'Service'];
export const COMPLAINT_SEVERITIES: ComplaintSeverity[] = ['Critical', 'High', 'Medium', 'Low'];
export const COMPLAINT_STATUSES: ComplaintStatus[] = ['New', 'Acknowledged', 'Investigating', 'Resolved'];
export const SLA_HOURS: Record<ComplaintSeverity, number> = { Critical: 4, High: 24, Medium: 72, Low: 120 };
export const PV_WINDOW_HOURS = 24;

export const SAMPLE_LIMITS: Record<string, number> = {
  'Coflin Forte 600mg': 40,
  'Tuxil-N Syrup 100ml': 30,
  'Astrazon 10mg': 25,
};
// Issued earlier this month, before today's calls.
const SAMPLES_USED_BEFORE: Record<string, number> = {
  'Coflin Forte 600mg': 28,
  'Tuxil-N Syrup 100ml': 18,
  'Astrazon 10mg': 9,
};
export const SAMPLE_BATCHES: Record<string, string[]> = {
  'Coflin Forte 600mg': ['CF24-0917', 'CF24-0822'],
  'Tuxil-N Syrup 100ml': ['TX24-0811'],
  'Astrazon 10mg': ['AZ24-0730', 'AZ24-0904'],
};

const daysAgo = (n: number, h = 10, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString();
export const fmtShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });

// Past calls keyed by a fragment of the customer name.
const HISTORY: { match: RegExp; visits: PastInteraction[] }[] = [
  {
    match: /reddington/i,
    visits: [
      { date: daysAgo(7), hcpName: 'Dr. Akin Bello', hcpType: 'Doctor', specialty: 'Internal Medicine', products: ['Coflin Forte 600mg', 'Astrazon 10mg'], summary: 'Detailed Coflin Forte for chronic bronchitis. Asked for the dosing study.', nextStep: 'Bring the Coflin Forte dosing study and confirm ward stock.' },
      { date: daysAgo(21), hcpName: 'Dr. Akin Bello', hcpType: 'Doctor', specialty: 'Internal Medicine', products: ['Coflin Forte 600mg'], summary: 'Prescribing steady. Raised concern about pharmacy stock-outs.', nextStep: 'Check hospital pharmacy stock with procurement.' },
      { date: daysAgo(35), hcpName: 'Dr. Akin Bello', hcpType: 'Doctor', specialty: 'Internal Medicine', products: ['Astrazon 10mg'], summary: 'Introduced Astrazon for allergic rhinitis cases.', nextStep: 'Leave Astrazon samples for the clinic.' },
    ],
  },
  {
    match: /lakeshore/i,
    visits: [
      { date: daysAgo(6), hcpName: 'Dr. T. Adebayo', hcpType: 'Doctor', specialty: 'Internal Medicine', products: ['Coflin Forte 600mg', 'Tuxil-N Syrup 100ml'], summary: 'Requested clinical data on Coflin for paediatric dosing. Open to Tuxil-N for the clinic.', nextStep: 'Bring the paediatric pack and discuss a ward trial.' },
      { date: daysAgo(20), hcpName: 'Dr. T. Adebayo', hcpType: 'Doctor', specialty: 'Internal Medicine', products: ['Astrazon 10mg'], summary: 'Brought up Astrazon. GSK rep visited the week before with a discount offer.', nextStep: 'Share Astrazon price list and the Q4 institutional terms.' },
      { date: daysAgo(33), hcpName: 'Dr. T. Adebayo', hcpType: 'Doctor', specialty: 'Internal Medicine', products: ['Coflin Forte 600mg'], summary: 'First detail of Coflin Forte 600mg. Positive on the once-daily dose.', nextStep: 'Follow up in two weeks with samples.' },
    ],
  },
  {
    match: /st\.? nicholas/i,
    visits: [
      { date: daysAgo(8), hcpName: 'Dr. C. Okonkwo', hcpType: 'Doctor', specialty: 'Paediatrics', products: ['Tuxil-N Syrup 100ml', 'Coflin Forte 600mg'], summary: 'Prefers Tuxil-N for under-fives. Asked about the 100ml pack availability.', nextStep: 'Confirm Tuxil-N 100ml supply date with the distributor.' },
      { date: daysAgo(22), hcpName: 'Dr. C. Okonkwo', hcpType: 'Doctor', specialty: 'Paediatrics', products: ['Astrazon 10mg'], summary: 'Detailed Astrazon. Left samples with the ward sister.', nextStep: 'Collect feedback on the Astrazon samples.' },
      { date: daysAgo(36), hcpName: 'Dr. C. Okonkwo', hcpType: 'Doctor', specialty: 'Paediatrics', products: ['Tuxil-N Syrup 100ml'], summary: 'Discussed cough season demand on the paediatric ward.', nextStep: 'Bring the paediatric dosing card.' },
    ],
  },
  {
    match: /medplus/i,
    visits: [
      { date: daysAgo(5), hcpName: 'Mrs. Funke Eze', hcpType: 'Pharmacist', specialty: 'Pharmacist', products: ['Tuxil-N Syrup 100ml', 'Coflin Forte 600mg'], summary: 'Tuxil-N moving fast. Shelf facings dropped to 2 after the reset.', nextStep: 'Restore 4 facings for Tuxil-N and put up the new shelf strip.' },
      { date: daysAgo(19), hcpName: 'Mrs. Funke Eze', hcpType: 'Pharmacist', specialty: 'Pharmacist', products: ['Coflin Forte 600mg'], summary: 'Stock check done. Coflin low, reorder placed through the distributor.', nextStep: 'Confirm the distributor delivered the Coflin reorder.' },
      { date: daysAgo(34), hcpName: 'Mrs. Funke Eze', hcpType: 'Pharmacist', specialty: 'Pharmacist', products: ['Astrazon 10mg'], summary: 'Price tag missing on Astrazon. Competitor promo on the counter.', nextStep: 'Bring printed price tags and a counter display.' },
    ],
  },
  {
    match: /healthplus/i,
    visits: [
      { date: daysAgo(9), hcpName: 'Mrs. R. Doherty', hcpType: 'Pharmacist', specialty: 'Pharmacist', products: ['Astrazon 10mg', 'Tuxil-N Syrup 100ml'], summary: 'Astrazon at eye level. Asked about bonus packs for the cold season.', nextStep: 'Send the Q4 bonus pack scheme.' },
      { date: daysAgo(24), hcpName: 'Mrs. R. Doherty', hcpType: 'Pharmacist', specialty: 'Pharmacist', products: ['Coflin Forte 600mg'], summary: 'Coflin out of stock for a week.', nextStep: 'Escalate the Coflin stock-out to the distributor.' },
    ],
  },
  {
    match: /eko hospital/i,
    visits: [
      { date: daysAgo(10), hcpName: 'Dr. N. Olaniyan', hcpType: 'Doctor', specialty: 'Paediatrics', products: ['Tuxil-N Syrup 100ml'], summary: 'Interested in a paediatric CME on cough management.', nextStep: 'Propose CME dates to the head of department.' },
    ],
  },
];

const SEED_RECORDS: CallRecord[] = [
  { logId: 'ce-1', repName: 'Chinedu Eze', timestamp: '', institution: 'Reddington Hospital Ikeja', hcpName: 'Dr. K. Balogun', samples: [{ id: 's1', sku: 'Coflin Forte 600mg', batch: 'CF24-0917', qty: 8, recipient: 'Dr. K. Balogun' }], intelCategories: ['Pricing'], complaintIds: [], signature: null },
  { logId: 'ce-2', repName: 'Chinedu Eze', timestamp: '', institution: 'HealthPlus Ikeja', hcpName: 'Mrs. A. Nwosu', samples: [{ id: 's2', sku: 'Astrazon 10mg', batch: 'AZ24-0904', qty: 6, recipient: 'Mrs. A. Nwosu' }], intelCategories: ['Promotion', 'Stock-out'], complaintIds: ['CMP-1038'], signature: null },
  { logId: 'ce-3', repName: 'Chinedu Eze', timestamp: '', institution: 'Eko Hospital Ikeja', hcpName: 'Dr. S. Oyelaran', samples: [{ id: 's3', sku: 'Coflin Forte 600mg', batch: 'CF24-0917', qty: 10, recipient: 'Dr. S. Oyelaran' }], intelCategories: [], complaintIds: [], signature: null },
  { logId: 'ce-4', repName: 'Chinedu Eze', timestamp: '', institution: 'First Consultant Ikeja', hcpName: 'Dr. I. Okafor', samples: [{ id: 's4', sku: 'Astrazon 10mg', batch: 'AZ24-0730', qty: 4, recipient: 'Dr. I. Okafor' }], intelCategories: ['New launch'], complaintIds: [], signature: null },
];

const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-1041', loggedAt: hoursAgo(3), repName: 'Adaeze Okafor', customer: 'Reddington Hospital', hcpName: 'Dr. Akin Bello',
    category: 'Adverse event', severity: 'High', product: 'Coflin Forte 600mg', batch: 'CF24-0822',
    description: 'Patient reported a skin rash two days after starting Coflin Forte. Doctor stopped the drug and asked for the PV form.',
    status: 'Acknowledged', owner: 'Tunde Bakare', resolutionNote: '', events: [
      { at: hoursAgo(3), by: 'Adaeze Okafor', text: 'Logged in the field' },
      { at: hoursAgo(2), by: 'Tunde Bakare', text: 'Acknowledged' },
    ],
  },
  {
    id: 'CMP-1039', loggedAt: daysAgo(2, 11, 20), repName: 'Adaeze Okafor', customer: 'MedPlus Lekki Phase 1', hcpName: 'Mrs. Funke Eze',
    category: 'Delivery', severity: 'Medium', product: 'Tuxil-N Syrup 100ml', batch: 'TX24-0811',
    description: 'Distributor delivered 30 bottles against an order of 50. Pharmacy is out on the shelf.',
    status: 'Investigating', owner: 'Funmi Adeola', resolutionNote: '', events: [
      { at: daysAgo(2, 11, 20), by: 'Adaeze Okafor', text: 'Logged in the field' },
      { at: daysAgo(2, 14, 5), by: 'Tunde Bakare', text: 'Acknowledged' },
      { at: daysAgo(1, 9, 40), by: 'Funmi Adeola', text: 'Investigating · checking the distributor dispatch note' },
    ],
  },
  {
    id: 'CMP-1038', loggedAt: hoursAgo(30), repName: 'Chinedu Eze', customer: 'HealthPlus Ikeja', hcpName: 'Mrs. A. Nwosu',
    category: 'Pricing', severity: 'Low', product: 'Astrazon 10mg', batch: '',
    description: 'Pharmacy says the distributor price is ₦120 above the list price on the last invoice.',
    status: 'New', owner: 'Unassigned', resolutionNote: '', events: [
      { at: hoursAgo(30), by: 'Chinedu Eze', text: 'Logged in the field' },
    ],
  },
  {
    id: 'CMP-1036', loggedAt: daysAgo(4, 15, 10), repName: 'Adaeze Okafor', customer: 'St Nicholas Hospital', hcpName: 'Dr. C. Okonkwo',
    category: 'Product quality', severity: 'High', product: 'Tuxil-N Syrup 100ml', batch: 'TX24-0811',
    description: 'Two bottles in a carton had loose caps and sticky residue on the label.',
    status: 'Resolved', owner: 'Tunde Bakare', resolutionNote: 'QA inspected retained samples of TX24-0811. Capping line torque corrected. Customer received 2 replacement bottles.', events: [
      { at: daysAgo(4, 15, 10), by: 'Adaeze Okafor', text: 'Logged in the field' },
      { at: daysAgo(4, 16, 0), by: 'Tunde Bakare', text: 'Acknowledged' },
      { at: daysAgo(3, 10, 0), by: 'Tunde Bakare', text: 'Investigating · referred to QA' },
      { at: daysAgo(1, 12, 30), by: 'Tunde Bakare', text: 'Resolved' },
    ],
  },
  {
    id: 'CMP-1034', loggedAt: hoursAgo(50), repName: 'Bisi Adewale', customer: 'Lagoon Hospital Apapa', hcpName: 'Dr. O. Ige',
    category: 'Service', severity: 'Medium', product: 'Coflin Forte 600mg', batch: '',
    description: 'Hospital pharmacy says no rep has called in six weeks and the price list is out of date.',
    status: 'Acknowledged', owner: 'Tunde Bakare', resolutionNote: '', events: [
      { at: hoursAgo(50), by: 'Bisi Adewale', text: 'Logged in the field' },
      { at: hoursAgo(46), by: 'Tunde Bakare', text: 'Acknowledged' },
    ],
  },
];

// ===== Helpers =====
export function historyFor(customer: string): PastInteraction[] {
  const hit = HISTORY.find(h => h.match.test(customer));
  return hit ? hit.visits.slice(0, 3) : [];
}

export function isRetailOutlet(name: string, role?: string): boolean {
  return /pharmac/i.test(role ?? '') || /medplus|healthplus|pharmacy|chemist/i.test(name);
}

export function slaDueAt(c: Complaint): number {
  return new Date(c.loggedAt).getTime() + SLA_HOURS[c.severity] * 3600000;
}

export function pvDueAt(c: Complaint): number {
  return new Date(c.loggedAt).getTime() + PV_WINDOW_HOURS * 3600000;
}

export function sampleTotal(lines: SampleLine[]): number {
  return lines.reduce((s, l) => s + (l.qty || 0), 0);
}

const nowClock = () => new Date().toISOString();

// ===== Store =====
interface FieldCallState {
  drafts: Record<string, VisitDraft>;
  saveDraft: (visitId: string, draft: VisitDraft) => void;
  clearDraft: (visitId: string) => void;
  records: CallRecord[];
  addRecord: (r: CallRecord) => void;
  recordFor: (logId: string) => CallRecord | undefined;
  orders: FieldOrder[];
  recordOrder: (o: FieldOrder) => void;
  // Left this month for the rep, excluding what the open draft is about to issue.
  sampleAllowance: (repName: string, sku: string) => { limit: number; used: number; left: number };
  samplesIssued: (repName: string, logIds?: string[]) => number;
  complaints: Complaint[];
  logComplaint: (c: Omit<Complaint, 'id' | 'loggedAt' | 'status' | 'owner' | 'resolutionNote' | 'events'>) => Complaint;
  setComplaintStatus: (id: string, status: ComplaintStatus, by: string, note?: string) => void;
  assignComplaint: (id: string, owner: string, by: string) => void;
  referToPv: (id: string, by: string) => void;
}

const Ctx = createContext<FieldCallState | null>(null);

export function FieldCallProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Record<string, VisitDraft>>({});
  const [records, setRecords] = useState<CallRecord[]>(SEED_RECORDS);
  const [orders, setOrders] = useState<FieldOrder[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>(SEED_COMPLAINTS);
  const [seq, setSeq] = useState(1042);

  const saveDraft = (visitId: string, draft: VisitDraft) => setDrafts(prev => ({ ...prev, [visitId]: draft }));
  const clearDraft = (visitId: string) => setDrafts(prev => {
    const next = { ...prev };
    delete next[visitId];
    return next;
  });

  const addRecord = (r: CallRecord) => setRecords(prev => [r, ...prev.filter(p => p.logId !== r.logId)]);
  const recordFor = (logId: string) => records.find(r => r.logId === logId);
  const recordOrder = (o: FieldOrder) => setOrders(prev => [o, ...prev]);

  const sampleAllowance: FieldCallState['sampleAllowance'] = (repName, sku) => {
    const limit = SAMPLE_LIMITS[sku] ?? 20;
    const month = new Date().getMonth();
    const logged = records
      .filter(r => r.repName === repName && r.timestamp && new Date(r.timestamp).getMonth() === month)
      .flatMap(r => r.samples)
      .filter(s => s.sku === sku)
      .reduce((n, s) => n + s.qty, 0);
    const used = (SAMPLES_USED_BEFORE[sku] ?? 0) + logged;
    return { limit, used, left: Math.max(0, limit - used) };
  };

  const samplesIssued: FieldCallState['samplesIssued'] = (repName, logIds) => {
    const today = new Date().toDateString();
    return records
      .filter(r => logIds ? logIds.includes(r.logId) : (r.repName === repName && r.timestamp && new Date(r.timestamp).toDateString() === today))
      .reduce((n, r) => n + sampleTotal(r.samples), 0);
  };

  const logComplaint: FieldCallState['logComplaint'] = input => {
    const at = nowClock();
    const c: Complaint = {
      ...input,
      id: `CMP-${seq}`,
      loggedAt: at,
      status: 'New',
      owner: 'Unassigned',
      resolutionNote: '',
      events: [{ at, by: input.repName, text: 'Logged in the field' }],
    };
    setSeq(s => s + 1);
    setComplaints(prev => [c, ...prev]);
    return c;
  };

  const setComplaintStatus: FieldCallState['setComplaintStatus'] = (id, status, by, note) => {
    setComplaints(prev => prev.map(c => c.id !== id ? c : {
      ...c,
      status,
      owner: c.owner === 'Unassigned' ? by : c.owner,
      resolutionNote: status === 'Resolved' ? (note ?? c.resolutionNote) : c.resolutionNote,
      events: [...c.events, { at: nowClock(), by, text: note && status !== 'Resolved' ? `${status} · ${note}` : status }],
    }));
  };

  const assignComplaint: FieldCallState['assignComplaint'] = (id, owner, by) => {
    setComplaints(prev => prev.map(c => c.id !== id ? c : {
      ...c, owner, events: [...c.events, { at: nowClock(), by, text: `Owner set to ${owner}` }],
    }));
  };

  const referToPv: FieldCallState['referToPv'] = (id, by) => {
    const at = nowClock();
    setComplaints(prev => prev.map(c => c.id !== id ? c : {
      ...c, pvReferredAt: at, events: [...c.events, { at, by, text: 'Referred to Pharmacovigilance' }],
    }));
  };

  return (
    <Ctx.Provider value={{
      drafts, saveDraft, clearDraft, records, addRecord, recordFor, orders, recordOrder,
      sampleAllowance, samplesIssued, complaints, logComplaint, setComplaintStatus, assignComplaint, referToPv,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFieldCall(): FieldCallState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFieldCall must be used inside FieldCallProvider');
  return v;
}

// Visit-log rows for the DCR layouts, joined with the field-call extras.
export interface DcrRow {
  time: string;
  checkIn?: string;
  hcp: string;
  institution: string;
  products: string[];
  samples: number;
  sampleDetail: string;
  intel: string;
  complaints: string[];
  orders: string[];
  signed: boolean;
}

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function buildDcrRows(logs: VisitLog[], records: CallRecord[], orders: FieldOrder[]): DcrRow[] {
  return [...logs]
    .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
    .map(l => {
      const r = records.find(x => x.logId === l.id);
      const visitOrders = orders.filter(o => l.activeVisitId !== undefined && o.visitId === String(l.activeVisitId));
      const intelBits = [
        ...(r?.intelCategories ?? []),
        l.marketIntel?.competitor ? l.marketIntel.competitor : '',
      ].filter(Boolean);
      return {
        time: hhmm(l.timestamp),
        checkIn: r?.checkInAt ? hhmm(r.checkInAt) : undefined,
        hcp: l.hcpName,
        institution: l.institution,
        products: l.productsDiscussed,
        samples: r ? sampleTotal(r.samples) : 0,
        sampleDetail: r ? r.samples.map(s => `${s.qty} × ${s.sku.split(' ')[0]} (${s.batch})`).join(', ') : '',
        intel: intelBits.join(' · '),
        complaints: r?.complaintIds ?? [],
        orders: visitOrders.map(o => `₦${o.total.toLocaleString()}`),
        signed: !!r?.signature || visitOrders.some(o => !!o.signedBy),
      };
    });
}
