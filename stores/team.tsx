import { createContext, useContext, useState, type ReactNode } from 'react';
import { PRODUCT_CATALOG } from '../assets/products';

// Manager supervision state shared across ASM, RSM and rep screens.

export type ManagerKey = 'asm' | 'manager';

export interface TeamManager {
  key: ManagerKey;
  name: string;
  initials: string;
  role: 'ASM' | 'RSM';
  scope: string;
  reportsTo: string;
}

export interface TeamRep {
  name: string;
  initials: string;
  territory: string;
  asm: boolean;
}

export const MANAGERS: Record<ManagerKey, TeamManager> = {
  asm: { key: 'asm', name: 'Funmi Adeola', initials: 'FA', role: 'ASM', scope: 'Lekki / V.I. Cluster', reportsTo: 'Tunde Bakare (RSM)' },
  manager: { key: 'manager', name: 'Tunde Bakare', initials: 'TB', role: 'RSM', scope: 'Lagos Region', reportsTo: 'Kemi Adeyemi (DM)' },
};

export const CURRENT_REP = 'Adaeze Okafor';

export const TEAM_REPS: TeamRep[] = [
  { name: 'Adaeze Okafor', initials: 'AO', territory: 'V.I. East', asm: true },
  { name: 'Tope Adeola', initials: 'TA', territory: 'Lekki Phase 1', asm: true },
  { name: 'Bayo Salami', initials: 'BS', territory: 'Lekki Phase 2', asm: true },
  { name: 'Yetunde Cole', initials: 'YC', territory: 'V.I. West', asm: true },
  { name: 'Chinedu Eze', initials: 'CE', territory: 'Ikeja', asm: false },
  { name: 'Kola Adeniyi', initials: 'KA', territory: 'Apapa', asm: false },
  { name: 'Fatima Bello', initials: 'FB', territory: 'Ibadan', asm: false },
];

export const repsFor = (m: ManagerKey) => TEAM_REPS.filter(r => m === 'manager' || r.asm);
export const territoriesFor = (m: ManagerKey) => repsFor(m).map(r => r.territory);
export const managerLabel = (m: ManagerKey) => `${MANAGERS[m].name} (${MANAGERS[m].role})`;

export interface FocusSku {
  id: string;
  name: string;
  category: string;
}

export const FOCUS_SKUS: FocusSku[] = [
  ...PRODUCT_CATALOG.map(p => ({ id: p.id, name: p.name, category: p.category })),
  { id: 'ciprotab', name: 'Ciprotab 500mg', category: 'Antibiotic · RX' },
  { id: 'natalben', name: 'Natalben Supra', category: 'Prenatal · OTC' },
];

export interface TrainingModule {
  id: string;
  title: string;
  minutes: number;
  sections: number;
}

export const TRAINING_CATALOGUE: TrainingModule[] = [
  { id: 'coflin-paeds', title: 'Coflin paediatric dosing', minutes: 6, sections: 4 },
  { id: 'discount-limit', title: 'Your discount limit', minutes: 4, sections: 3 },
  { id: 'complaint', title: 'Logging a complaint', minutes: 3, sections: 3 },
  { id: 'astrazon-detail', title: 'Detailing Astrazon to GPs', minutes: 8, sections: 5 },
  { id: 'gps-checkin', title: 'GPS check-in and offline sync', minutes: 5, sections: 3 },
];

export type CoachingKind = 'note' | '1:1' | 'micro-coach' | 'scheduled';

export interface CoachingEntry {
  id: string;
  rep: string;
  by: ManagerKey;
  kind: CoachingKind;
  text: string;
  date: string;
}

export interface Message {
  id: string;
  rep: string;
  manager: ManagerKey;
  from: 'manager' | 'rep';
  text: string;
  at: string;
  read: boolean;
}

export interface OwnVisit {
  id: string;
  by: ManagerKey;
  customer: string;
  checkIn: string;
  gps: string;
  notes: string;
  date: string;
}

export interface JointVisit {
  id: string;
  by: ManagerKey;
  kind: 'joint-call' | 'accompaniment';
  rep: string;
  customer: string;
  product: string;
  minutes: number;
  notes: string;
  date: string;
}

export type ActivityCategory = 'approval' | 'field' | 'coaching' | 'admin' | 'meeting' | 'system' | 'message' | 'training';

export interface ActivityEntry {
  id: string;
  by: ManagerKey;
  t: string;
  n: string;
  d: string;
  cat: ActivityCategory;
  who: string;
}

export type TrainingStatus = 'not-started' | 'in-progress' | 'done';

export interface TrainingTask {
  id: string;
  rep: string;
  moduleId: string;
  assignedBy: ManagerKey;
  assignedOn: string;
  due: string;
  status: TrainingStatus;
  progress: number;
}

export interface FocusSetting {
  skus: string[];
  setBy: ManagerKey;
  on: string;
}

export interface Delegation {
  to: string;
  from: string;
  until: string;
  reason: string;
}

export interface EscalationTimeouts {
  itineraryMinutes: number;
  adjustmentMinutes: number;
  escalateTo: string;
}

export interface UpwardReceipt {
  id: string;
  from: ManagerKey;
  to: string;
  at: string;
  note: string;
}

export const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
export const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const shortDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}${y !== new Date().getFullYear() ? ` ${y}` : ''}`;
};
export const untilLabel = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (days === 0) return 'end of today';
  if (days > 0 && days < 7) return WEEKDAYS[target.getDay()];
  return shortDate(iso);
};
export const isOverdue = (t: TrainingTask) => t.status !== 'done' && t.due < isoDay();
export const moduleFor = (id: string) => TRAINING_CATALOGUE.find(m => m.id === id) ?? TRAINING_CATALOGUE[0];

let seq = 100;
const nid = (p: string) => `${p}-${++seq}`;

const SEED_COACHING: CoachingEntry[] = [
  { id: 'c-1', rep: 'Adaeze Okafor', by: 'asm', kind: '1:1', text: 'Q2 review · on track, push for institutional close on Lakeshore', date: isoDay(-6) },
  { id: 'c-2', rep: 'Adaeze Okafor', by: 'asm', kind: 'note', text: 'Discussed Coflin focus strategy · she is ahead of plan', date: isoDay(-13) },
  { id: 'c-3', rep: 'Tope Adeola', by: 'asm', kind: 'note', text: 'Top performer this month · suggested KAM track', date: isoDay(-4) },
  { id: 'c-4', rep: 'Bayo Salami', by: 'asm', kind: '1:1', text: 'Improvement in conversion · keep on Coflin focus', date: isoDay(-2) },
  { id: 'c-5', rep: 'Yetunde Cole', by: 'asm', kind: 'note', text: 'Last check-in · pipeline volume concern raised', date: isoDay(-18) },
  { id: 'c-6', rep: 'Chinedu Eze', by: 'manager', kind: '1:1', text: 'Reddington CM follow-up · confirm attendee list before Friday', date: isoDay(-3) },
];

const SEED_MESSAGES: Message[] = [
  { id: 'm-1', rep: 'Adaeze Okafor', manager: 'manager', from: 'manager', text: 'Strong start this week. Push for institutional close on Lakeshore, they are top tier for Q2.', at: '08:12', read: false },
  { id: 'm-2', rep: 'Adaeze Okafor', manager: 'asm', from: 'manager', text: 'Can you send me the Lakeshore pharmacy contact before 2pm? I will join you on Thursday.', at: 'Yesterday', read: true },
  { id: 'm-3', rep: 'Adaeze Okafor', manager: 'asm', from: 'rep', text: 'Sent. It is Pharm. Ngozi Eke on 0803 412 7781.', at: 'Yesterday', read: true },
  { id: 'm-4', rep: 'Yetunde Cole', manager: 'asm', from: 'rep', text: 'MedPlus V.I. moved my 11am to tomorrow. Can I swap in Eko Hospital?', at: '09:21', read: false },
  { id: 'm-5', rep: 'Bayo Salami', manager: 'asm', from: 'manager', text: 'Good call on the Lekki Phase 2 reroute this morning.', at: '09:45', read: true },
  { id: 'm-6', rep: 'Chinedu Eze', manager: 'manager', from: 'rep', text: 'Reddington CM budget is with PM now. Attendee list attached in the visit log.', at: '10:02', read: false },
];

const SEED_OWN_VISITS: OwnVisit[] = [
  { id: 'ov-1', by: 'asm', customer: 'Eko Hospital, Ikeja', checkIn: '07:40', gps: '6.5960° N, 3.3420° E · ±12 m', notes: 'Met Chief Pharmacist on Coflin stock-out. Agreed a 40-pack restock through Adaeze.', date: isoDay(-1) },
];

const SEED_JOINT: JointVisit[] = [
  { id: 'jv-1', by: 'asm', kind: 'accompaniment', rep: 'Bayo Salami', customer: 'MedPlus Lekki', product: 'Coflin Forte 600mg', minutes: 45, notes: 'Opened well. Missed the dosing comparison, coached after the call.', date: isoDay() },
  { id: 'jv-2', by: 'manager', kind: 'joint-call', rep: 'Chinedu Eze', customer: 'Reddington Hospital', product: 'Astrazon 10mg', minutes: 30, notes: 'Head of ENT open to a lunch CM in June.', date: isoDay(-2) },
];

const SEED_ACTIVITY: ActivityEntry[] = [
  { id: 'a-1', by: 'asm', t: '10:30', n: 'Reviewed Adaeze\'s Lakeshore visit', d: 'Approved 18% discount request', cat: 'approval', who: 'Funmi → Adaeze' },
  { id: 'a-2', by: 'asm', t: '09:55', n: 'Field accompaniment with Bayo', d: 'Joined visit to MedPlus Lekki · 45 min', cat: 'field', who: 'Funmi + Bayo' },
  { id: 'a-3', by: 'asm', t: '09:40', n: '1:1 with Bayo Salami', d: 'Lekki Phase 2 strategy review · Coaching note logged', cat: 'coaching', who: 'Funmi + Bayo' },
  { id: 'a-4', by: 'asm', t: '09:00', n: 'Pushed itinerary changes', d: 'Re-assigned 2 visits from Yetunde to Tope', cat: 'admin', who: 'Funmi' },
  { id: 'a-5', by: 'asm', t: '08:30', n: 'Daily team huddle', d: '4 reps · 8 min · Coflin Q2 focus discussed', cat: 'meeting', who: 'Funmi + 4 reps' },
  { id: 'a-6', by: 'asm', t: '08:15', n: 'Reviewed yesterday\'s DCRs', d: '4 reports · All accepted · Auto-pushed to BM', cat: 'admin', who: 'Funmi' },
  { id: 'a-7', by: 'asm', t: '08:00', n: 'Day started · GPS active', d: 'Lekki office', cat: 'system', who: 'Funmi' },
  { id: 'a-8', by: 'manager', t: '08:05', n: 'Day started · GPS active', d: 'Ikoyi regional office', cat: 'system', who: 'Tunde' },
];

const SEED_TRAINING: TrainingTask[] = [
  { id: 't-1', rep: 'Adaeze Okafor', moduleId: 'coflin-paeds', assignedBy: 'asm', assignedOn: isoDay(-3), due: isoDay(2), status: 'not-started', progress: 0 },
  { id: 't-2', rep: 'Adaeze Okafor', moduleId: 'discount-limit', assignedBy: 'manager', assignedOn: isoDay(-5), due: isoDay(1), status: 'in-progress', progress: 40 },
  { id: 't-3', rep: 'Tope Adeola', moduleId: 'coflin-paeds', assignedBy: 'asm', assignedOn: isoDay(-3), due: isoDay(2), status: 'done', progress: 100 },
  { id: 't-4', rep: 'Bayo Salami', moduleId: 'coflin-paeds', assignedBy: 'asm', assignedOn: isoDay(-3), due: isoDay(2), status: 'in-progress', progress: 65 },
  { id: 't-5', rep: 'Yetunde Cole', moduleId: 'complaint', assignedBy: 'asm', assignedOn: isoDay(-8), due: isoDay(-2), status: 'not-started', progress: 0 },
  { id: 't-6', rep: 'Chinedu Eze', moduleId: 'discount-limit', assignedBy: 'manager', assignedOn: isoDay(-5), due: isoDay(1), status: 'done', progress: 100 },
  { id: 't-7', rep: 'Fatima Bello', moduleId: 'gps-checkin', assignedBy: 'manager', assignedOn: isoDay(-9), due: isoDay(-1), status: 'in-progress', progress: 20 },
];

const SEED_TERRITORY_FOCUS: Record<string, FocusSetting> = {
  'V.I. East': { skus: ['coflin', 'astrazon', 'tuxil'], setBy: 'asm', on: isoDay(-10) },
  'V.I. West': { skus: ['coflin', 'tuxil'], setBy: 'asm', on: isoDay(-10) },
  'Lekki Phase 1': { skus: ['coflin', 'natalben'], setBy: 'asm', on: isoDay(-10) },
  'Lekki Phase 2': { skus: ['coflin', 'astrazon'], setBy: 'asm', on: isoDay(-10) },
  'Ikeja': { skus: ['astrazon', 'ciprotab'], setBy: 'manager', on: isoDay(-14) },
  'Apapa': { skus: ['coflin', 'ciprotab'], setBy: 'manager', on: isoDay(-14) },
  'Ibadan': { skus: ['coflin', 'tuxil', 'natalben'], setBy: 'manager', on: isoDay(-14) },
};

interface TeamState {
  coaching: CoachingEntry[];
  messages: Message[];
  ownVisits: OwnVisit[];
  jointVisits: JointVisit[];
  activity: ActivityEntry[];
  training: TrainingTask[];
  territoryFocus: Record<string, FocusSetting>;
  repFocus: Record<string, FocusSetting>;
  delegation: Delegation | null;
  timeouts: EscalationTimeouts;
  deadlines: Record<string, number>;
  receipts: UpwardReceipt[];

  addCoaching: (rep: string, by: ManagerKey, kind: CoachingKind, text: string) => void;
  sendMessage: (rep: string, manager: ManagerKey, from: 'manager' | 'rep', text: string) => void;
  markThreadRead: (rep: string, manager: ManagerKey, reader: 'manager' | 'rep') => void;
  logOwnVisit: (v: Omit<OwnVisit, 'id' | 'date'>) => void;
  logJointVisit: (v: Omit<JointVisit, 'id' | 'date'>) => void;
  logActivity: (a: Omit<ActivityEntry, 'id' | 't'>) => void;
  assignTraining: (reps: string[], moduleId: string, due: string, by: ManagerKey) => void;
  advanceTraining: (id: string, step?: number) => void;
  completeTraining: (id: string) => void;
  remindTraining: (id: string) => void;
  setTerritoryFocus: (territory: string, skus: string[], by: ManagerKey) => void;
  setRepFocus: (rep: string, skus: string[] | null, by: ManagerKey) => void;
  focusFor: (rep: string) => { skus: string[]; setBy: ManagerKey; territory: string; override: boolean };
  setDelegation: (d: Delegation | null) => void;
  setTimeouts: (t: Partial<EscalationTimeouts>) => void;
  seedDeadlines: (items: Record<string, number>) => void;
  setDeadline: (id: string, at: number) => void;
  sendUpward: (from: ManagerKey, to: string, note: string) => UpwardReceipt;
}

const Ctx = createContext<TeamState | null>(null);

const firstName = (n: string) => n.split(' ')[0];

export function TeamProvider({ children }: { children: ReactNode }) {
  const [coaching, setCoaching] = useState<CoachingEntry[]>(SEED_COACHING);
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [ownVisits, setOwnVisits] = useState<OwnVisit[]>(SEED_OWN_VISITS);
  const [jointVisits, setJointVisits] = useState<JointVisit[]>(SEED_JOINT);
  const [activity, setActivity] = useState<ActivityEntry[]>(SEED_ACTIVITY);
  const [training, setTraining] = useState<TrainingTask[]>(SEED_TRAINING);
  const [territoryFocus, setTerritoryFocusState] = useState<Record<string, FocusSetting>>(SEED_TERRITORY_FOCUS);
  const [repFocus, setRepFocusState] = useState<Record<string, FocusSetting>>({});
  const [delegation, setDelegation] = useState<Delegation | null>(null);
  const [timeouts, setTimeoutsState] = useState<EscalationTimeouts>({ itineraryMinutes: 240, adjustmentMinutes: 30, escalateTo: 'Kemi Adeyemi (DM)' });
  const [deadlines, setDeadlines] = useState<Record<string, number>>({});
  const [receipts, setReceipts] = useState<UpwardReceipt[]>([]);

  const logActivity: TeamState['logActivity'] = a => {
    setActivity(prev => [{ ...a, id: nid('a'), t: clock() }, ...prev]);
  };

  const addCoaching: TeamState['addCoaching'] = (rep, by, kind, text) => {
    setCoaching(prev => [{ id: nid('c'), rep, by, kind, text, date: isoDay() }, ...prev]);
    const me = firstName(MANAGERS[by].name);
    const title = kind === '1:1' ? `1:1 with ${rep}` : kind === 'micro-coach' ? `Micro-coach sent to ${rep}` : kind === 'scheduled' ? `1:1 scheduled with ${rep}` : `Coaching note on ${rep}`;
    logActivity({ by, n: title, d: text, cat: 'coaching', who: `${me} → ${firstName(rep)}` });
  };

  const sendMessage: TeamState['sendMessage'] = (rep, manager, from, text) => {
    setMessages(prev => [...prev, { id: nid('m'), rep, manager, from, text, at: clock(), read: false }]);
    if (from === 'manager') {
      logActivity({ by: manager, n: `Message to ${rep}`, d: text.length > 70 ? `${text.slice(0, 70)}...` : text, cat: 'message', who: `${firstName(MANAGERS[manager].name)} → ${firstName(rep)}` });
    }
  };

  const markThreadRead: TeamState['markThreadRead'] = (rep, manager, reader) => {
    const incoming = reader === 'rep' ? 'manager' : 'rep';
    setMessages(prev => prev.map(m => m.rep === rep && m.manager === manager && m.from === incoming && !m.read ? { ...m, read: true } : m));
  };

  const logOwnVisit: TeamState['logOwnVisit'] = v => {
    setOwnVisits(prev => [{ ...v, id: nid('ov'), date: isoDay() }, ...prev]);
    logActivity({ by: v.by, n: `Own field visit · ${v.customer}`, d: `Checked in ${v.checkIn} · ${v.notes}`, cat: 'field', who: firstName(MANAGERS[v.by].name) });
  };

  const logJointVisit: TeamState['logJointVisit'] = v => {
    setJointVisits(prev => [{ ...v, id: nid('jv'), date: isoDay() }, ...prev]);
    const label = v.kind === 'joint-call' ? 'Joint call' : 'Field accompaniment';
    logActivity({ by: v.by, n: `${label} with ${firstName(v.rep)}`, d: `${v.customer} · ${v.product} · ${v.minutes} min`, cat: 'field', who: `${firstName(MANAGERS[v.by].name)} + ${firstName(v.rep)}` });
  };

  const assignTraining: TeamState['assignTraining'] = (reps, moduleId, due, by) => {
    const fresh = reps.map(rep => ({ id: nid('t'), rep, moduleId, assignedBy: by, assignedOn: isoDay(), due, status: 'not-started' as const, progress: 0 }));
    setTraining(prev => [...fresh, ...prev]);
    const mod = moduleFor(moduleId);
    logActivity({ by, n: `Assigned training · ${mod.title}`, d: `${reps.length} rep${reps.length === 1 ? '' : 's'} · due ${shortDate(due)}`, cat: 'training', who: `${firstName(MANAGERS[by].name)} → ${reps.map(firstName).join(', ')}` });
  };

  const advanceTraining: TeamState['advanceTraining'] = (id, step = 25) => {
    setTraining(prev => prev.map(t => {
      if (t.id !== id || t.status === 'done') return t;
      const progress = Math.min(100, t.progress + step);
      return { ...t, progress, status: progress >= 100 ? 'done' : 'in-progress' };
    }));
  };

  const completeTraining: TeamState['completeTraining'] = id => {
    setTraining(prev => prev.map(t => t.id === id ? { ...t, progress: 100, status: 'done' } : t));
  };

  const remindTraining: TeamState['remindTraining'] = id => {
    const t = training.find(x => x.id === id);
    if (!t) return;
    const mod = moduleFor(t.moduleId);
    sendMessage(t.rep, t.assignedBy, 'manager', `Reminder: please finish "${mod.title}" (${mod.minutes} min) by ${shortDate(t.due)}.`);
  };

  const setTerritoryFocus: TeamState['setTerritoryFocus'] = (territory, skus, by) => {
    setTerritoryFocusState(prev => ({ ...prev, [territory]: { skus, setBy: by, on: isoDay() } }));
    logActivity({ by, n: `Focus products set for ${territory}`, d: skus.map(s => FOCUS_SKUS.find(f => f.id === s)?.name ?? s).join(', '), cat: 'admin', who: firstName(MANAGERS[by].name) });
  };

  const setRepFocus: TeamState['setRepFocus'] = (rep, skus, by) => {
    setRepFocusState(prev => {
      const next = { ...prev };
      if (skus) next[rep] = { skus, setBy: by, on: isoDay() };
      else delete next[rep];
      return next;
    });
    logActivity({ by, n: skus ? `Focus override for ${rep}` : `Focus override cleared for ${rep}`, d: skus ? skus.map(s => FOCUS_SKUS.find(f => f.id === s)?.name ?? s).join(', ') : 'Back to territory list', cat: 'admin', who: firstName(MANAGERS[by].name) });
  };

  const focusFor: TeamState['focusFor'] = rep => {
    const territory = TEAM_REPS.find(r => r.name === rep)?.territory ?? 'V.I. East';
    const o = repFocus[rep];
    if (o) return { skus: o.skus, setBy: o.setBy, territory, override: true };
    const t = territoryFocus[territory] ?? { skus: ['coflin'], setBy: 'asm' as ManagerKey, on: isoDay() };
    return { skus: t.skus, setBy: t.setBy, territory, override: false };
  };

  const setTimeouts: TeamState['setTimeouts'] = t => setTimeoutsState(prev => ({ ...prev, ...t }));

  const seedDeadlines: TeamState['seedDeadlines'] = items => {
    setDeadlines(prev => {
      const missing = Object.keys(items).filter(k => prev[k] == null);
      if (missing.length === 0) return prev;
      const next = { ...prev };
      missing.forEach(k => { next[k] = items[k]; });
      return next;
    });
  };

  const setDeadline: TeamState['setDeadline'] = (id, at) => setDeadlines(prev => ({ ...prev, [id]: at }));

  const sendUpward: TeamState['sendUpward'] = (from, to, note) => {
    const r: UpwardReceipt = { id: nid('up'), from, to, at: clock(), note };
    setReceipts(prev => [r, ...prev]);
    logActivity({ by: from, n: `Summary sent to ${to}`, d: note.length > 70 ? `${note.slice(0, 70)}...` : note, cat: 'admin', who: firstName(MANAGERS[from].name) });
    return r;
  };

  return (
    <Ctx.Provider value={{
      coaching, messages, ownVisits, jointVisits, activity, training, territoryFocus, repFocus, delegation, timeouts, deadlines, receipts,
      addCoaching, sendMessage, markThreadRead, logOwnVisit, logJointVisit, logActivity, assignTraining, advanceTraining,
      completeTraining, remindTraining, setTerritoryFocus, setRepFocus, focusFor, setDelegation, setTimeouts, seedDeadlines, setDeadline, sendUpward,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTeam(): TeamState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTeam must be used inside TeamProvider');
  return v;
}
