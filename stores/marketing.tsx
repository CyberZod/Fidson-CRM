import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { CAMPAIGNS, CAMPAIGN_TRACKING } from '../assets/campaigns';
import type { Campaign, ContentApprovalRow, DirectiveRow, PromoRequest } from '../types';

// Marketing workflows that cross personas: PM materials -> MM/HoM approval -> rep library,
// rep promo request -> PM approve/launch -> Campaigns & ROI, directives -> chosen reps -> acknowledgement.
// Module-level store so App can read it too (badges, rep feed) before or without the provider.

// ===== Field roster (audience targeting) =====
export type RepChannel = 'institution' | 'trade' | 'mobile-frontline';
export type RegionCode = 'SW' | 'SE' | 'SS' | 'NC' | 'NW' | 'NE';

export interface RosterRep {
  name: string;
  channel: RepChannel;
  region: RegionCode;
  territory: string;
}

export const CHANNEL_LABEL: Record<RepChannel, string> = {
  institution: 'Institution',
  trade: 'Trade',
  'mobile-frontline': 'Mobile & Frontline',
};

export const REGION_LABEL: Record<RegionCode, string> = {
  SW: 'South-West', SE: 'South-East', SS: 'South-South', NC: 'North-Central', NW: 'North-West', NE: 'North-East',
};

export const TERRITORIES: Record<RegionCode, string[]> = {
  SW: ['Lekki / V.I.', 'Ikeja', 'Surulere', 'Ibadan', 'Abeokuta'],
  SE: ['Enugu', 'Onitsha', 'Aba'],
  SS: ['Port Harcourt', 'Benin', 'Calabar'],
  NC: ['Abuja', 'Jos', 'Ilorin'],
  NW: ['Kano', 'Kaduna', 'Sokoto'],
  NE: ['Bauchi', 'Maiduguri', 'Yola'],
};

export const LIVE_REP = 'Adaeze Okafor';

const NAMED: RosterRep[] = [
  { name: 'Adaeze Okafor', channel: 'institution', region: 'SW', territory: 'Lekki / V.I.' },
  { name: 'Tope Adeola', channel: 'institution', region: 'SW', territory: 'Surulere' },
  { name: 'Bayo Salami', channel: 'institution', region: 'SW', territory: 'Lekki / V.I.' },
  { name: 'Yetunde Cole', channel: 'institution', region: 'SW', territory: 'Lekki / V.I.' },
  { name: 'Kola Adewale', channel: 'institution', region: 'SW', territory: 'Ikeja' },
  { name: 'Chinedu Eze', channel: 'institution', region: 'SE', territory: 'Enugu' },
  { name: 'Joseph Nwankwo', channel: 'institution', region: 'SS', territory: 'Port Harcourt' },
  { name: 'Babatunde Owolabi', channel: 'trade', region: 'SW', territory: 'Ikeja' },
  { name: 'Chioma Igwe', channel: 'trade', region: 'SW', territory: 'Ibadan' },
  { name: 'Sodiq Ajao', channel: 'trade', region: 'SW', territory: 'Abeokuta' },
];

const FIRST = ['Amaka', 'Ibrahim', 'Funmilayo', 'Emeka', 'Halima', 'Olumide', 'Ngozi', 'Musa', 'Blessing', 'Tunde',
  'Aisha', 'Femi', 'Ifeoma', 'Yusuf', 'Bisola', 'Obinna', 'Zainab', 'Segun', 'Chiamaka', 'Usman', 'Kemi', 'Nnamdi'];
const LAST = ['Okonkwo', 'Bello', 'Adeyemi', 'Nwosu', 'Abubakar', 'Ogundipe', 'Eze', 'Danjuma', 'Akinola', 'Okeke',
  'Lawal', 'Adebisi', 'Uche', 'Garba', 'Oyelaran', 'Chukwu', 'Sani', 'Fashola', 'Obi', 'Ibekwe', 'Balogun', 'Etim'];
const REGION_CYCLE: RegionCode[] = ['SW', 'SW', 'SE', 'SS', 'NC', 'SW', 'NW', 'SE', 'NC', 'SS', 'NE', 'SW'];
const CHANNEL_TARGET: Record<RepChannel, number> = { institution: 89, trade: 38, 'mobile-frontline': 15 };

const buildRoster = (): RosterRep[] => {
  const out = [...NAMED];
  const used = new Set(out.map(r => r.name));
  let i = 0;
  (Object.keys(CHANNEL_TARGET) as RepChannel[]).forEach(ch => {
    while (out.filter(r => r.channel === ch).length < CHANNEL_TARGET[ch]) {
      const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 7 + Math.floor(i / FIRST.length) * 5 + 3) % LAST.length]}`;
      const region = REGION_CYCLE[i % REGION_CYCLE.length];
      const terrs = TERRITORIES[region];
      i++;
      if (used.has(name)) continue;
      used.add(name);
      out.push({ name, channel: ch, region, territory: terrs[i % terrs.length] });
    }
  });
  return out;
};

export const ROSTER: RosterRep[] = buildRoster();

export interface Audience {
  channels: RepChannel[];
  regions: RegionCode[];
  territories: string[];
  reps: string[];
}

export const EMPTY_AUDIENCE: Audience = { channels: [], regions: [], territories: [], reps: [] };

export const resolveAudience = (a: Audience): RosterRep[] => {
  if (a.reps.length) return ROSTER.filter(r => a.reps.includes(r.name));
  return ROSTER.filter(r =>
    (!a.channels.length || a.channels.includes(r.channel)) &&
    (!a.regions.length || a.regions.includes(r.region)) &&
    (!a.territories.length || a.territories.includes(r.territory)));
};

export const audienceLabel = (a: Audience): string => {
  if (a.reps.length) return a.reps.length <= 2 ? a.reps.join(', ') : `${a.reps.length} named reps`;
  const parts = [
    a.channels.length ? a.channels.map(c => CHANNEL_LABEL[c]).join(' + ') : 'All channels',
    a.regions.length ? a.regions.join(', ') : 'all regions',
  ];
  if (a.territories.length) parts.push(a.territories.join(', '));
  return parts.join(' · ');
};

const clock = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const ackTimes = ['08:12', '08:26', '08:41', '09:03', '09:15', '09:32', '09:58', '10:07', '10:22', '10:40', '11:05', '11:18'];

// ===== Materials (detailing library) =====
export type MaterialCategory = 'Clinical' | 'Detailing' | 'Competitive' | 'Marketing';
export type MaterialStatus = 'pending' | 'approved' | 'rejected';

export interface Material {
  id: string;
  title: string;
  product: string;
  cat: MaterialCategory;
  format: 'PDF' | 'PPT';
  pages: number;
  sizeMb: number;
  version: string;
  fileName: string;
  audience: Audience;
  status: MaterialStatus;
  submittedBy: string;
  submitted: string;
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
  urgent?: boolean;
  budget?: string;
  pushed: number;
  opened: number;
  isNew?: boolean;
  keyMessages: string[];
}

const INST: Audience = { ...EMPTY_AUDIENCE, channels: ['institution'] };
const ALL: Audience = EMPTY_AUDIENCE;

const SEED_MATERIALS: Material[] = [
  { id: 'mat-1', title: 'Coflin Paediatric Dosing Guide', product: 'Coflin Forte 600mg', cat: 'Clinical', format: 'PDF', pages: 4, sizeMb: 4.2, version: '2.1', fileName: 'Coflin_Paed_Dosing_v2.1.pdf', audience: INST, status: 'pending', submittedBy: 'Dr. Femi Akande', submitted: '2 hours ago', note: 'Updated to include new WHO paediatric dosing thresholds. Cleared by Medical Affairs.', pushed: 0, opened: 0, isNew: true, keyMessages: ['Weight-based dosing from 2 years', 'Twice daily with meals', 'No adjustment for mild renal impairment'] },
  { id: 'mat-2', title: 'Augmentin Counter-Detail Brief', product: 'Coflin Forte 600mg', cat: 'Competitive', format: 'PDF', pages: 6, sizeMb: 2.8, version: '1.0', fileName: 'Augmentin_Counter_Brief.pdf', audience: ALL, status: 'pending', submittedBy: 'Dr. Femi Akande', submitted: '45 min ago', urgent: true, note: 'In response to GSK 15% Augmentin promo detected in 5 regions. Time-sensitive.', pushed: 0, opened: 0, isNew: true, keyMessages: ['Cost per course 22% lower', 'Same-day availability at 12 Lagos distributors', 'Paediatric syrup option'] },
  { id: 'mat-3', title: 'Cardio Q3 Detailing Deck', product: 'Astrazon 10mg', cat: 'Detailing', format: 'PPT', pages: 28, sizeMb: 11.6, version: '1.0', fileName: 'Cardio_Q3_Deck.pptx', audience: { ...INST, regions: ['SW', 'NC'] }, status: 'pending', submittedBy: 'Dr. Ngozi Eze', submitted: 'Yesterday', budget: '₦680k production', note: 'Q3 launch deck for the cardio portfolio refresh.', pushed: 0, opened: 0, keyMessages: ['Once-daily dosing', 'Specialist clinic positioning', 'New data cards for cardiology'] },
  { id: 'mat-4', title: 'Coflin Forte Q2 Brochure', product: 'Coflin Forte 600mg', cat: 'Marketing', format: 'PDF', pages: 8, sizeMb: 3.4, version: '1.0', fileName: 'Coflin_Q2_Brochure.pdf', audience: INST, status: 'approved', submittedBy: 'Dr. Femi Akande', submitted: '3 days ago', approvedBy: 'Tola Adekunle', approvedAt: 'May 10', budget: '₦420k print', pushed: 89, opened: 71, keyMessages: ['Respiratory portfolio overview', 'Hospital formulary listing', 'Patient counselling points'] },
  { id: 'mat-5', title: 'Coflin Clinical Trial Brief', product: 'Coflin Forte 600mg', cat: 'Clinical', format: 'PDF', pages: 12, sizeMb: 5.1, version: '1.4', fileName: 'Coflin_Trial_Brief_v1.4.pdf', audience: ALL, status: 'approved', submittedBy: 'Dr. Femi Akande', submitted: '2 weeks ago', approvedBy: 'Tola Adekunle', approvedAt: 'May 2', pushed: 142, opened: 98, keyMessages: ['Multi-centre trial, 420 patients', '91% symptom resolution by day 5', 'Well tolerated in children'] },
  { id: 'mat-6', title: 'Coflin Q2 Detailing Deck', product: 'Coflin Forte 600mg', cat: 'Detailing', format: 'PPT', pages: 24, sizeMb: 9.8, version: '3.0', fileName: 'Coflin_Q2_Deck_v3.pptx', audience: INST, status: 'approved', submittedBy: 'Dr. Femi Akande', submitted: '1 month ago', approvedBy: 'Ade Olawale', approvedAt: 'Apr 18', pushed: 89, opened: 81, keyMessages: ['Mechanism of action', 'Dosing table', 'Objection handling vs Augmentin'] },
  { id: 'mat-7', title: 'Tuxil-N OTC Detailing Deck', product: 'Tuxil-N Syrup 100ml', cat: 'Detailing', format: 'PPT', pages: 18, sizeMb: 7.2, version: '2.2', fileName: 'TuxilN_OTC_Deck.pptx', audience: { ...EMPTY_AUDIENCE, channels: ['trade', 'mobile-frontline'] }, status: 'approved', submittedBy: 'Dr. Femi Akande', submitted: '1 month ago', approvedBy: 'Tola Adekunle', approvedAt: 'Apr 11', pushed: 53, opened: 38, keyMessages: ['Cough season positioning', 'Shelf placement', 'Pharmacist recommendation script'] },
];

// ===== Directives =====
export interface TrackedDirective extends DirectiveRow {
  audience: Audience;
  recipientNames: string[];
  acks: Record<string, string>;
  managerRecipients: number;
  fromRole: string;
  reminders: number;
  remindedAt?: string;
}

const seedDirective = (d: Omit<TrackedDirective, 'recipientNames' | 'acks' | 'reminders'>, ackCount: number, liveAcked: boolean): TrackedDirective => {
  const recipientNames = resolveAudience(d.audience).map(r => r.name);
  const acks: Record<string, string> = {};
  recipientNames.filter(n => n !== LIVE_REP).forEach((n, i) => {
    if (Object.keys(acks).length < ackCount - (liveAcked ? 1 : 0) && (i * 37) % 7 !== 3) acks[n] = ackTimes[i % ackTimes.length];
  });
  if (liveAcked && recipientNames.includes(LIVE_REP)) acks[LIVE_REP] = '09:41';
  return { ...d, recipientNames, acks, reminders: 0 };
};

const SEED_DIRECTIVES: TrackedDirective[] = [
  seedDirective({ id: 'dir-1', pm: 'Dr. Femi Akande', fromRole: 'PM', title: 'Q3 Coflin Focus Initiative', message: 'Effective immediately, all reps to prioritise Coflin Forte 600mg detailing in institutional accounts. Push new paediatric dosing thresholds.', priority: 'high', targetProduct: 'Coflin Forte 600mg', date: 'Today, 10:15', status: 'active', kind: 'directive', audience: INST, managerRecipients: 0 }, 23, false),
  seedDirective({ id: 'dir-2', pm: 'Dr. Ngozi Eze', fromRole: 'PM', title: 'Cardio Portfolio Refresh', message: 'Incorporate new data cards for Astrazon 10mg. Focus on cardiology specialist clinics.', priority: 'normal', targetProduct: 'Astrazon 10mg', date: 'Yesterday', status: 'active', kind: 'directive', audience: { ...INST, regions: ['SW', 'NC'] }, managerRecipients: 0 }, 31, true),
  seedDirective({ id: 'dir-3', pm: 'Musa Lawal', fromRole: 'NSM Trade', title: 'Tuxil-N cough season stocking', message: 'Confirm every Tuxil-N stockist in your territory holds at least 4 weeks of cover before June 15.', priority: 'high', targetProduct: 'Tuxil-N Syrup 100ml', date: 'Mon, 08:30', status: 'active', kind: 'directive', audience: { ...EMPTY_AUDIENCE, channels: ['trade'] }, managerRecipients: 6 }, 29, false),
];

// ===== Promo requests and campaigns =====
export interface TrackedCampaign extends Campaign {
  daysElapsed: number;
  targetRevenue: number;
  baselineWeeklyUnits: number;
  sourcePromoId?: string;
  requestedBy?: string;
}

const curve = (days: number) => Math.pow(Math.min(60, days) / 60, 0.8);

const SEED_PROMOS: PromoRequest[] = [
  { id: 'pr-1', rep: 'Adaeze Okafor', title: 'Coflin Bulk Trade Promo · Q3', product: 'Coflin Forte 600mg', channel: 'trade', scope: '12 Lagos distributors · 6 weeks', estimatedReach: 240, budget: 1_800_000, rationale: 'Augmentin counter-detail · Lagos trade distributors signaling demand swing if we run a 12% incentive band.', date: 'May 13, 2026', status: 'pending' },
  { id: 'pr-2', rep: 'Tope Adeola', title: 'Tuxil-N Retail Sampling · SW', product: 'Tuxil-N Syrup 100ml', channel: 'mobile-frontline', scope: '8 community pharmacies', estimatedReach: 90, budget: 420_000, rationale: 'OTC pull-through ahead of cough season. Sampling + posters.', date: 'May 12, 2026', status: 'pm-approved' },
  { id: 'pr-3', rep: 'Chinedu Eze', title: 'Astrazon Hospital Bundle', product: 'Astrazon 10mg', channel: 'institution', scope: '4 teaching hospitals', estimatedReach: 60, budget: 2_400_000, rationale: 'Co-prescription with Coflin for paediatric ENT clinics.', date: 'May 10, 2026', status: 'launched' },
];

const campaignFromPromo = (p: PromoRequest, days: number, startedAt: string): TrackedCampaign => {
  const target = Math.round(p.budget * 3.2);
  return {
    id: `cmp-${p.id}`,
    name: p.title,
    product: p.product,
    channel: (['institution', 'trade', 'mobile-frontline'].includes(p.channel) ? p.channel : 'all') as Campaign['channel'],
    owner: `${p.rep} (field request) · Dr. Femi Akande (PM)`,
    status: 'active',
    startedAt,
    attributionWindowDays: 60,
    materialsCost: Math.round(p.budget * 0.15),
    budgetSpent: Math.round(p.budget * 0.85),
    linkedCMs: 0,
    attendeesReached: p.estimatedReach,
    attributedRevenue: Math.round(target * curve(days)),
    regions: [ROSTER.find(r => r.name === p.rep)?.region ?? 'SW'],
    daysElapsed: days,
    targetRevenue: target,
    baselineWeeklyUnits: Math.max(40, Math.round(p.estimatedReach * 1.4)),
    sourcePromoId: p.id,
    requestedBy: p.rep,
  };
};

const SEED_CAMPAIGNS: TrackedCampaign[] = [
  ...CAMPAIGNS.map(c => {
    const t = CAMPAIGN_TRACKING[c.id] ?? { daysElapsed: 60, baselineWeeklyUnits: 120 };
    return { ...c, ...t, targetRevenue: Math.round(c.attributedRevenue / curve(t.daysElapsed)) };
  }),
  campaignFromPromo(SEED_PROMOS[2], 38, 'May 14, 2026'),
];

// ===== Store =====
interface MarketingState {
  materials: Material[];
  offline: Record<string, string>;
  openedBy: Record<string, true>;
  directives: TrackedDirective[];
  promoRequests: PromoRequest[];
  campaigns: TrackedCampaign[];
}

let state: MarketingState = {
  materials: SEED_MATERIALS,
  offline: { 'mat-6': 'May 12' },
  openedBy: {},
  directives: SEED_DIRECTIVES,
  promoRequests: SEED_PROMOS,
  campaigns: SEED_CAMPAIGNS,
};
const listeners = new Set<() => void>();
const set = (next: Partial<MarketingState>) => {
  state = { ...state, ...next };
  listeners.forEach(l => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export interface MaterialUpload {
  title: string;
  product: string;
  cat: MaterialCategory;
  format: 'PDF' | 'PPT';
  fileName: string;
  sizeMb: number;
  pages: number;
  audience: Audience;
  note?: string;
  urgent?: boolean;
}

export interface DirectiveInput {
  title: string;
  message: string;
  targetProduct?: string;
  priority: string;
  kind?: 'directive' | 'new-product';
  audience: Audience;
  from: string;
  fromRole: string;
  managerRecipients?: number;
  includeReps: boolean;
}

export type PromoInput = Omit<PromoRequest, 'id' | 'date' | 'status'>;

const actions = {
  submitMaterial(u: MaterialUpload, by = 'Dr. Femi Akande'): Material {
    const m: Material = {
      id: `mat-${Date.now()}`, title: u.title, product: u.product, cat: u.cat, format: u.format, pages: u.pages,
      sizeMb: u.sizeMb, version: '1.0', fileName: u.fileName, audience: u.audience, status: 'pending', submittedBy: by,
      submitted: `Today ${clock()}`, note: u.note, urgent: u.urgent, pushed: 0, opened: 0, isNew: true,
      keyMessages: [`${u.product} key message summary`, 'Approved claims only', 'Use with HCPs in targeted accounts'],
    };
    set({ materials: [m, ...state.materials] });
    return m;
  },
  approveMaterial(id: string, by: string) {
    set({
      materials: state.materials.map(m => m.id === id
        ? { ...m, status: 'approved', approvedBy: by, approvedAt: `Today ${clock()}`, pushed: resolveAudience(m.audience).length }
        : m),
    });
  },
  rejectMaterial(id: string, by: string) {
    set({ materials: state.materials.map(m => m.id === id ? { ...m, status: 'rejected', approvedBy: by, approvedAt: `Today ${clock()}` } : m) });
  },
  pushMaterial(id: string, audience: Audience) {
    set({ materials: state.materials.map(m => m.id === id ? { ...m, audience, pushed: resolveAudience(audience).length } : m) });
  },
  saveOffline(id: string) {
    set({ offline: { ...state.offline, [id]: `Today ${clock()}` } });
  },
  removeOffline(id: string) {
    const next = { ...state.offline };
    delete next[id];
    set({ offline: next });
  },
  markOpened(id: string) {
    if (state.openedBy[id]) return;
    set({
      openedBy: { ...state.openedBy, [id]: true },
      materials: state.materials.map(m => m.id === id ? { ...m, opened: Math.min(m.pushed, m.opened + 1) } : m),
    });
  },

  pushDirective(input: DirectiveInput): TrackedDirective {
    const recipientNames = input.includeReps ? resolveAudience(input.audience).map(r => r.name) : [];
    const d: TrackedDirective = {
      id: `dir-${Date.now()}`, pm: input.from, fromRole: input.fromRole, title: input.title, message: input.message,
      priority: input.priority, targetProduct: input.targetProduct, date: `Today, ${clock()}`, status: 'active',
      kind: input.kind ?? 'directive', audience: input.audience, recipientNames, acks: {},
      managerRecipients: input.managerRecipients ?? 0, reminders: 0, recipients: recipientNames.length + (input.managerRecipients ?? 0),
    };
    set({ directives: [d, ...state.directives] });
    // a handful of early readers acknowledge within seconds, like the live system would show
    if (recipientNames.length) {
      window.setTimeout(() => {
        const early = recipientNames.filter(n => n !== LIVE_REP).slice(0, Math.max(1, Math.round(recipientNames.length * 0.08)));
        set({
          directives: state.directives.map(x => x.id === d.id
            ? { ...x, acks: { ...x.acks, ...Object.fromEntries(early.map(n => [n, clock()])) } }
            : x),
        });
      }, 4000);
    }
    return d;
  },
  acknowledgeDirective(id: string, rep = LIVE_REP) {
    set({ directives: state.directives.map(d => d.id === id ? { ...d, acks: { ...d.acks, [rep]: clock() } } : d) });
  },
  remindDirective(id: string): number {
    const d = state.directives.find(x => x.id === id);
    if (!d) return 0;
    const pending = d.recipientNames.filter(n => !d.acks[n]);
    set({ directives: state.directives.map(x => x.id === id ? { ...x, reminders: x.reminders + 1, remindedAt: clock() } : x) });
    window.setTimeout(() => {
      const responders = pending.filter(n => n !== LIVE_REP).slice(0, Math.max(1, Math.round(pending.length * 0.15)));
      set({
        directives: state.directives.map(x => x.id === id
          ? { ...x, acks: { ...x.acks, ...Object.fromEntries(responders.map(n => [n, clock()])) } }
          : x),
      });
    }, 3000);
    return pending.length;
  },

  submitPromo(input: PromoInput): PromoRequest {
    const p: PromoRequest = { ...input, id: `pr-${Date.now()}`, date: 'Today', status: 'pending' };
    set({ promoRequests: [p, ...state.promoRequests] });
    return p;
  },
  approvePromo(id: string) {
    set({ promoRequests: state.promoRequests.map(p => p.id === id ? { ...p, status: 'pm-approved' } : p) });
  },
  rejectPromo(id: string) {
    set({ promoRequests: state.promoRequests.map(p => p.id === id ? { ...p, status: 'rejected' } : p) });
  },
  launchPromo(id: string): TrackedCampaign | undefined {
    const p = state.promoRequests.find(x => x.id === id);
    if (!p) return undefined;
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const c = campaignFromPromo(p, 0, `Today · ${today}`);
    set({
      promoRequests: state.promoRequests.map(x => x.id === id ? { ...x, status: 'launched' } : x),
      campaigns: [c, ...state.campaigns.filter(x => x.id !== c.id)],
    });
    return c;
  },
  refreshAttribution(id: string) {
    set({
      campaigns: state.campaigns.map(c => {
        if (c.id !== id || c.daysElapsed >= 60) return c;
        const days = Math.min(60, c.daysElapsed + 14);
        return { ...c, daysElapsed: days, attributedRevenue: Math.round(c.targetRevenue * curve(days)), status: days >= 60 ? 'closed' : c.status };
      }),
    });
  },
};

export type MarketingApi = MarketingState & typeof actions & {
  contentApprovals: ContentApprovalRow[];
  directivesFor: (rep: string) => DirectiveRow[];
  libraryFor: (rep: string) => Material[];
};

const toApprovalRow = (m: Material): ContentApprovalRow => ({
  id: m.id,
  material: `${m.title} v${m.version}`,
  pm: m.submittedBy,
  cat: m.cat,
  format: `${m.format} · ${m.pages} ${m.format === 'PPT' ? 'slides' : 'pages'} · ${m.sizeMb} MB`,
  target: `${audienceLabel(m.audience)} · ${resolveAudience(m.audience).length} reps`,
  budget: m.budget ?? 'None',
  submitted: m.submitted,
  note: m.note,
  status: m.status,
  urgent: m.urgent,
});

const directivesFor = (rep: string): DirectiveRow[] =>
  state.directives
    .filter(d => d.recipientNames.includes(rep))
    .map(d => ({ ...d, acknowledged: !!d.acks[rep] }));

const libraryFor = (rep: string): Material[] =>
  state.materials.filter(m => m.status === 'approved' && resolveAudience(m.audience).some(r => r.name === rep));

const MarketingContext = createContext<true | null>(null);

export function MarketingProvider({ children }: { children: ReactNode }) {
  return <MarketingContext.Provider value={true}>{children}</MarketingContext.Provider>;
}

export function useMarketing(): MarketingApi {
  useContext(MarketingContext);
  const s = useSyncExternalStore(subscribe, () => state);
  return {
    ...s,
    ...actions,
    contentApprovals: s.materials.map(toApprovalRow),
    directivesFor,
    libraryFor,
  };
}
