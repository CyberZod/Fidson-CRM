import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

// Shared admin console state: the people directory and the audit log every config change writes to.
// Module-level store so screens keep working even before the provider is mounted.

export type AuditArea =
  | 'People & roles' | 'Territories' | 'Catalogue' | 'Customers' | 'Permissions'
  | 'Forms' | 'Workflows' | 'Duplicates' | 'Rules' | 'Models' | 'Imports'
  | 'Go-live' | 'Rollout' | 'Docs' | 'Feedback' | 'Sync queue';

export const AUDIT_AREAS: AuditArea[] = [
  'People & roles', 'Territories', 'Catalogue', 'Customers', 'Permissions', 'Forms', 'Workflows',
  'Duplicates', 'Rules', 'Models', 'Imports', 'Go-live', 'Rollout', 'Docs', 'Feedback', 'Sync queue',
];

export interface AuditEntry {
  id: string;
  at: string;          // ISO timestamp
  who: string;
  area: AuditArea;
  what: string;
  before: string;
  after: string;
  ip: string;
  device: string;
}

export type AdminRole = 'Medical Rep' | 'ASM' | 'RSM' | 'FSM' | 'DM' | 'NSM' | 'PM' | 'MM' | 'HoM' | 'Platform Admin' | 'Support Desk';
export type Division = 'Institution' | 'Trade' | 'HCP' | 'Consumer';

export interface AdminPerson {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  division: Division;
  region: string;
  territory: string;
  managerId: string | null;
  active: boolean;
  lastSeen: string;
}

export const ADMIN_ACTOR = 'Ngozi Ibe';
const ADMIN_IP = '10.20.4.17';
const ADMIN_DEVICE = 'Edge · Windows 11 · FID-LT-0142';

const SEED_PEOPLE: AdminPerson[] = [
  { id: 'p01', name: 'Kunle Adebayo', email: 'k.adebayo@fidson.com', role: 'NSM', division: 'Institution', region: 'National', territory: 'National', managerId: null, active: true, lastSeen: 'Today 09:12' },
  { id: 'p02', name: 'Chioma Eze', email: 'c.eze@fidson.com', role: 'DM', division: 'Institution', region: 'South West', territory: 'South West', managerId: 'p01', active: true, lastSeen: 'Today 08:40' },
  { id: 'p03', name: 'Tunde Bakare', email: 't.bakare@fidson.com', role: 'RSM', division: 'Institution', region: 'Lagos', territory: 'Lagos Island', managerId: 'p02', active: true, lastSeen: 'Today 10:05' },
  { id: 'p04', name: 'Femi Ogunleye', email: 'f.ogunleye@fidson.com', role: 'ASM', division: 'Institution', region: 'Lagos', territory: 'Lekki Cluster', managerId: 'p03', active: true, lastSeen: 'Today 07:58' },
  { id: 'p05', name: 'Adaeze Okafor', email: 'a.okafor@fidson.com', role: 'Medical Rep', division: 'Institution', region: 'Lagos', territory: 'Lekki Cluster', managerId: 'p04', active: true, lastSeen: 'Today 10:31' },
  { id: 'p06', name: 'Bayo Salami', email: 'b.salami@fidson.com', role: 'Medical Rep', division: 'Institution', region: 'Lagos', territory: 'V.I. Cluster', managerId: 'p04', active: true, lastSeen: 'Today 09:47' },
  { id: 'p07', name: 'Tope Adeola', email: 't.adeola@fidson.com', role: 'Medical Rep', division: 'Institution', region: 'Lagos', territory: 'Mainland Cluster', managerId: 'p04', active: true, lastSeen: 'Yesterday 17:20' },
  { id: 'p08', name: 'Yetunde Cole', email: 'y.cole@fidson.com', role: 'Medical Rep', division: 'Trade', region: 'Lagos', territory: 'Surulere', managerId: 'p09', active: true, lastSeen: 'Today 08:15' },
  { id: 'p09', name: 'Ibrahim Musa', email: 'i.musa@fidson.com', role: 'FSM', division: 'Trade', region: 'Lagos', territory: 'Lagos Trade', managerId: 'p02', active: true, lastSeen: 'Today 09:01' },
  { id: 'p10', name: 'Segun Ajayi', email: 's.ajayi@fidson.com', role: 'Medical Rep', division: 'Institution', region: 'Oyo', territory: 'Ibadan North', managerId: 'p11', active: true, lastSeen: 'Today 08:52' },
  { id: 'p11', name: 'Funke Oladipo', email: 'f.oladipo@fidson.com', role: 'ASM', division: 'Institution', region: 'Oyo', territory: 'Ibadan Cluster', managerId: 'p03', active: true, lastSeen: 'Yesterday 16:44' },
  { id: 'p12', name: 'Emeka Nwosu', email: 'e.nwosu@fidson.com', role: 'Medical Rep', division: 'HCP', region: 'FCT', territory: 'Abuja Central', managerId: 'p13', active: false, lastSeen: '12 days ago' },
  { id: 'p13', name: 'Hauwa Bello', email: 'h.bello@fidson.com', role: 'ASM', division: 'HCP', region: 'FCT', territory: 'Abuja Cluster', managerId: 'p02', active: true, lastSeen: 'Today 07:30' },
  { id: 'p14', name: 'Ngozi Ibe', email: 'ngozi.ibe@fidson.com', role: 'Platform Admin', division: 'Institution', region: 'Head Office', territory: 'Head Office', managerId: null, active: true, lastSeen: 'Now' },
];

const daysAgo = (d: number, h: number, m: number) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, m, 0, 0);
  return t.toISOString();
};

const SEED_AUDIT: AuditEntry[] = ([
  [0, 9, 14, ADMIN_ACTOR, 'Rules', 'Rule "A-tier no visit 21 days" published', 'Draft', 'Live · v1'],
  [0, 8, 52, ADMIN_ACTOR, 'People & roles', 'Reporting line for Segun Ajayi', 'Manager: Tunde Bakare', 'Manager: Funke Oladipo'],
  [1, 17, 5, 'Kola Adeyemi (Tales Support)', 'Imports', 'Customers import re-run', '14 errors', '0 errors · 2,418 rows'],
  [1, 15, 40, ADMIN_ACTOR, 'Workflows', 'Discount chain threshold', 'RSM up to 18%', 'RSM up to 20%'],
  [1, 11, 22, ADMIN_ACTOR, 'Forms', 'Visit log form published', 'v3', 'v4 · added "Samples left" field'],
  [2, 16, 10, 'Chinedu Obi (Fidson IT)', 'Permissions', 'ASM · Orders module', 'View', 'Approve'],
  [2, 10, 3, ADMIN_ACTOR, 'Catalogue', 'Price for Coflin Forte 600mg', '₦4,350', '₦4,500'],
  [3, 14, 48, ADMIN_ACTOR, 'Territories', 'MedPlus Yaba moved', 'Surulere', 'Mainland Cluster'],
  [3, 9, 30, ADMIN_ACTOR, 'Models', 'Visit pre-fill model', 'Standard', 'Fast'],
  [4, 13, 15, 'Chinedu Obi (Fidson IT)', 'People & roles', 'Emeka Nwosu deactivated', 'Active', 'Inactive · removed from Entra ID group'],
  [5, 12, 0, ADMIN_ACTOR, 'Duplicates', 'Merged Dr. A. Obi into Dr. Amaka Obi', '2 records', '1 record · 14 visits kept'],
  [6, 10, 41, ADMIN_ACTOR, 'Customers', 'Added Eko Hospital, Ikeja', 'None', 'Institution · Mainland Cluster'],
  [7, 15, 20, 'Kola Adeyemi (Tales Support)', 'Go-live', 'DR restore drill recorded', 'Not run', 'Passed · RTO 38 min'],
  [8, 11, 2, ADMIN_ACTOR, 'Rollout', 'Pilot SW wave status', 'Scheduled', 'Live'],
  [9, 16, 33, ADMIN_ACTOR, 'Feedback', 'Pilot 1 week 2 round signed off', 'Open', 'Signed off by Tunde Bakare'],
  [11, 9, 5, 'Chinedu Obi (Fidson IT)', 'Permissions', 'Medical Rep · Reports module', 'Hidden', 'View'],
  [13, 14, 0, ADMIN_ACTOR, 'Catalogue', 'Assigned Astrazon 10mg to Funke Oladipo', 'Not assigned', 'Assigned'],
  [16, 10, 18, ADMIN_ACTOR, 'Docs', 'Admin guide handed over', 'Draft', 'Signed off'],
  [20, 12, 45, 'Kola Adeyemi (Tales Support)', 'Imports', 'National master data loaded', 'Empty', '38,902 rows'],
  [24, 9, 0, ADMIN_ACTOR, 'Sync queue', 'Visit log conflict for Bayo Salami', 'Pending', 'Kept server'],
] as const).map(([d, h, m, who, area, what, before, after], i) => ({
  id: `a-seed-${i}`,
  at: daysAgo(d, h, m),
  who,
  area,
  what,
  before,
  after,
  ip: who === ADMIN_ACTOR ? ADMIN_IP : who.includes('Tales') ? '102.89.33.6' : '10.20.4.52',
  device: who === ADMIN_ACTOR ? ADMIN_DEVICE : who.includes('Tales') ? 'Chrome · macOS · VPN' : 'Edge · Windows 11 · FID-LT-0088',
}));

interface AdminState {
  people: AdminPerson[];
  audit: AuditEntry[];
}

let state: AdminState = { people: SEED_PEOPLE, audit: SEED_AUDIT };
const listeners = new Set<() => void>();
const set = (next: Partial<AdminState>) => {
  state = { ...state, ...next };
  listeners.forEach(l => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export interface RecordInput {
  area: AuditArea;
  what: string;
  before?: string;
  after?: string;
}

const record = ({ area, what, before = '', after = '' }: RecordInput) =>
  set({
    audit: [
      { id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString(), who: ADMIN_ACTOR, area, what, before, after, ip: ADMIN_IP, device: ADMIN_DEVICE },
      ...state.audit,
    ],
  });

const setPeople = (fn: (p: AdminPerson[]) => AdminPerson[]) => set({ people: fn(state.people) });

export interface AdminApi extends AdminState {
  record: (e: RecordInput) => void;
  setPeople: (fn: (p: AdminPerson[]) => AdminPerson[]) => void;
}

const AdminContext = createContext<true | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  return <AdminContext.Provider value={true}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminApi {
  useContext(AdminContext);
  const s = useSyncExternalStore(subscribe, () => state);
  return { ...s, record, setPeople };
}

export const formatAuditTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
